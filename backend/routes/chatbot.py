"""AI chatbot (Groq / Llama models under the hood).

Upgraded from a single-turn, non-streaming, globally-rate-limited endpoint to:
  - Real token-by-token streaming via Server-Sent Events (SSE)
  - Multi-turn memory (client sends conversation history, we forward it to Groq)
  - Per-user (or per-IP for guests) rate limiting, instead of one global lock
    that let a single spammy user block the chatbot for every other user
  - Stronger input validation (message + history shape/size limits)

NOTE on branding: this bot is powered by GroqCloud (Llama models), never Gemini.
Any "Powered by Google Gemini" text was incorrect and has been removed on the
frontend — this file never claimed that, the label lived in the React component.
"""

import os
import time
import json
import traceback
from collections import defaultdict
from threading import Lock

import requests
from flask import Blueprint, request, jsonify, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..models import User, Note, Subject

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api')

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

GROQ_MODELS = {
    'fast': 'llama-3.1-8b-instant',
    'balanced': 'llama-3.3-70b-versatile',
    'coding': 'qwen-2.5-coder-32b',
}

# ==================== RATE LIMITING (per-user, not global) ====================
# BUG FIX: the old implementation called `is_rate_limited()` with no argument,
# so every request (from every user, everywhere) shared a single "global" bucket
# in `last_request_time`. One person spamming the bot would block the chatbot
# for ALL users for RATE_LIMIT_SECONDS. Now every caller is keyed by their JWT
# user id when logged in, or their IP address as a fallback for guests, so
# limits are isolated per-caller.
RATE_LIMIT_SECONDS = 2
MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_MESSAGES = 20          # how many past turns we keep/accept
MAX_HISTORY_MESSAGE_LENGTH = 4000  # guard against a single huge history entry

_last_request_time = defaultdict(float)
_rate_limit_lock = Lock()


def get_rate_limit_key():
    """Per-user key when authenticated, otherwise per-IP for guests."""
    try:
        user_id = get_jwt_identity()
    except Exception:
        user_id = None
    if user_id:
        return f"user:{user_id}"
    # request.remote_addr respects X-Forwarded-For if ProxyFix/behind a proxy;
    # good enough as a fallback isolation key for anonymous users.
    return f"ip:{request.remote_addr or 'unknown'}"


def is_rate_limited(key):
    with _rate_limit_lock:
        now = time.time()
        if now - _last_request_time[key] < RATE_LIMIT_SECONDS:
            return True
        _last_request_time[key] = now
        return False


# ==================== VALIDATION ====================

def validate_chat_payload(data):
    """Returns (error_message_or_None, cleaned_message, cleaned_history)."""
    if not isinstance(data, dict):
        return "Invalid request body.", None, None

    message = data.get('message', '')
    if not isinstance(message, str):
        return "Message must be a string.", None, None
    message = message.strip()
    if not message:
        return "Message is required.", None, None
    if len(message) > MAX_MESSAGE_LENGTH:
        return f"Message is too long (max {MAX_MESSAGE_LENGTH} characters).", None, None

    raw_history = data.get('history', [])
    if raw_history is None:
        raw_history = []
    if not isinstance(raw_history, list):
        return "History must be a list.", None, None

    cleaned_history = []
    for item in raw_history[-MAX_HISTORY_MESSAGES:]:
        if not isinstance(item, dict):
            continue
        role = item.get('role')
        content = item.get('text', item.get('content', ''))
        if role not in ('user', 'assistant', 'bot'):
            continue
        if not isinstance(content, str) or not content.strip():
            continue
        role = 'assistant' if role == 'bot' else role
        cleaned_history.append({
            'role': role,
            'content': content.strip()[:MAX_HISTORY_MESSAGE_LENGTH]
        })

    return None, message, cleaned_history


# ==================== CONTEXT / KNOWLEDGE BASE (unchanged logic) ====================

def get_user_context(user_id):
    try:
        user = db.session.get(User, int(user_id))
        if not user:
            return None

        recent_subjects = db.session.execute(
            db.select(Note.subject_id, db.func.count(Note.id))
            .filter_by(user_id=user.id)
            .group_by(Note.subject_id)
            .limit(5)
        ).all()

        subject_names = []
        for sub_id, _ in recent_subjects:
            if sub_id:
                subject = db.session.get(Subject, sub_id)
                if subject:
                    subject_names.append(subject.name)

        return {
            'name': user.name,
            'course': user.branch or 'General',
            'semester': user.semester or 'Not specified',
            'subjects': subject_names if subject_names else ['General Studies']
        }
    except Exception as e:
        print(f"Error getting user context: {e}")
        return None


def search_knowledge_base(query, user_id=None):
    try:
        query_terms = query.lower().split()

        subjects = []
        for term in query_terms[:3]:
            subjects.extend(Subject.query.filter(Subject.name.ilike(f'%{term}%')).limit(3).all())

        notes = []
        for term in query_terms[:3]:
            notes.extend(Note.query.filter(Note.title.ilike(f'%{term}%'), Note.status == 'approved').limit(3).all())

        pyqs = []
        for term in query_terms[:3]:
            pyqs.extend(Note.query.filter(
                Note.note_type == 'pyq', Note.title.ilike(f'%{term}%'), Note.status == 'approved'
            ).limit(2).all())

        return {
            'subjects': list(set(subjects))[:5],
            'notes': list(set(notes))[:5],
            'pyqs': list(set(pyqs))[:3]
        }
    except Exception as e:
        print(f"Search error: {e}")
        return {'subjects': [], 'notes': [], 'pyqs': []}


SYSTEM_PROMPT = """You are a helpful study assistant for Study Portal.

**About Study Portal:**
- Created by: Karan Suyal
- Purpose: Free study materials platform for students
- Features: Notes, PYQs, Syllabus, Lab Manuals, Dark Mode, AI Chatbot
- Website: study-portal-app.vercel.app

**Your Role:**
1. Help students with academic questions
2. Guide them to study materials on the portal
3. Be friendly, encouraging, and concise (max 150 words)
4. If asked "who created this portal" or "who made study portal", say it was created by Karan Suyal
5. You remember the earlier messages in this conversation, so use that context naturally

**Rules:**
- Keep responses helpful and educational
- Suggest checking Materials section for notes/PYQs
- Don't give wrong academic information
- Be positive and supportive
- Use Markdown formatting where useful (bold, bullet lists, code blocks) since the UI renders it"""


def build_user_turn(user_message, user_context, search_results):
    context = ""
    if search_results['subjects']:
        context += "\n📚 **Relevant Subjects:**\n"
        for sub in search_results['subjects'][:3]:
            context += f"- {sub.name}\n"

    if search_results['notes']:
        context += "\n📄 **Available Notes:**\n"
        for note in search_results['notes'][:3]:
            context += f"- {note.title}\n"

    if search_results['pyqs']:
        context += "\n📝 **PYQs Available:**\n"
        for pyq in search_results['pyqs'][:2]:
            context += f"- {pyq.title}\n"

    if user_context:
        return f"""**Student Profile:**
- Name: {user_context['name']}
- Course: {user_context['course']}
- Semester: {user_context['semester']}
- Subjects: {', '.join(user_context['subjects'][:3])}

**Relevant Materials from Portal:**
{context if context else "No specific materials found in database for this query."}

**Student's Question:** {user_message}

**Instructions:**
1. Be friendly and encouraging 😊
2. Use the relevant materials from above if they help answer the question
3. If specific notes/PYQs are mentioned, suggest them
4. Keep response concise (max 150-200 words)
5. If you don't know something, suggest checking the study portal or asking a teacher

**Your Response:**"""

    return f"""**Relevant Materials from Portal:**
{context if context else "No specific materials found."}

**Student's Question:** {user_message}

**Instructions:**
1. Be friendly and helpful
2. Give concise answers (max 150 words)
3. If asked "who created this" or "who made study portal", say it was created by Karan Suyal
4. Suggest checking the study portal for more resources

**Your Response:**"""


def fallback_response(question):
    question_lower = question.lower()

    if 'who made' in question_lower or 'who created' in question_lower or 'who built' in question_lower:
        return "👨‍💻 **Study Portal** was created by **Karan Suyal**! It's a platform for free study materials including notes, PYQs, syllabus, and lab manuals for students."

    if 'notes' in question_lower or 'study material' in question_lower:
        return "📚 You can find study materials in the **Materials** section! Browse by course, year, and semester to access notes, PYQs, and syllabus."

    elif 'pyq' in question_lower or 'previous year' in question_lower:
        return "📝 Previous Year Questions are available in the Materials section. Select your course and subject to find PYQs for exam preparation!"

    elif 'exam' in question_lower or 'prepare' in question_lower:
        return "🎯 Exam preparation tips:\n- Review all PYQs\n- Make short notes\n- Practice regularly\n- Check the syllabus for important topics\n\nGood luck with your exams! 💪"

    elif 'syllabus' in question_lower:
        return "📋 Syllabus for all courses is available in the Materials section. Select your course, year, and semester to find the complete syllabus."

    elif 'dark mode' in question_lower:
        return "🌙 Dark mode is available! Look for the moon/sun icon in the navbar or at the bottom right corner to toggle between light and dark themes."

    else:
        return "👋 Hi there! I'm your study assistant. You can ask me about:\n\n- 📚 Notes & Study Materials\n- 📝 Previous Year Questions (PYQs)\n- 📋 Syllabus\n- 🎯 Exam Preparation\n- 🌙 Dark Mode\n\nWhat would you like to know?"


def sse_event(payload):
    return f"data: {json.dumps(payload)}\n\n"


def stream_groq(messages, model_name):
    """Yields raw text chunks (deltas) from Groq's streaming completion API.
    Raises on failure so the caller can fall back."""
    headers = {'Authorization': f'Bearer {GROQ_API_KEY}', 'Content-Type': 'application/json'}
    payload = {
        'model': model_name,
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 1024,
        'top_p': 0.9,
        'stream': True
    }

    with requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60, stream=True) as resp:
        if resp.status_code != 200:
            detail = ''
            try:
                detail = resp.json().get('error', {}).get('message', '')
            except Exception:
                pass
            raise RuntimeError(f"Groq API error {resp.status_code}: {detail}")

        for raw_line in resp.iter_lines(decode_unicode=True):
            if not raw_line:
                continue
            if not raw_line.startswith('data: '):
                continue
            chunk_data = raw_line[len('data: '):]
            if chunk_data.strip() == '[DONE]':
                break
            try:
                chunk = json.loads(chunk_data)
            except json.JSONDecodeError:
                continue
            delta = chunk.get('choices', [{}])[0].get('delta', {}).get('content')
            if delta:
                yield delta


def stream_fallback_text(text):
    """Chunk a canned fallback response into small pieces so the frontend's
    typewriter effect still animates even when Groq is unavailable."""
    words = text.split(' ')
    buf = ''
    for word in words:
        buf += word + ' '
        if len(buf) >= 8:
            yield buf
            buf = ''
    if buf:
        yield buf


@chatbot_bp.route('/chat', methods=['POST'])
@jwt_required(optional=True)
def chat_with_ai():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        error, user_message, history = validate_chat_payload(data)
        if error:
            return jsonify({'success': False, 'error': error}), 400

        rate_key = get_rate_limit_key()
        if is_rate_limited(rate_key):
            return jsonify({
                'success': False,
                'error': 'You are sending messages too fast. Please wait a moment.'
            }), 429

        user_context = None
        if user_id:
            user = db.session.get(User, int(user_id))
            if user:
                user_context = get_user_context(user.id)

        search_results = search_knowledge_base(user_message, user_id)
        current_turn = build_user_turn(user_message, user_context, search_results)

        messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
        messages.extend(history)
        messages.append({'role': 'user', 'content': current_turn})

        has_extra_materials = bool(search_results['notes'] or search_results['pyqs'])

        def generate():
            full_text = ''
            streamed_ok = False

            if GROQ_API_KEY:
                for model_key in ('balanced', 'fast'):
                    try:
                        full_text = ''
                        for delta in stream_groq(messages, GROQ_MODELS[model_key]):
                            full_text += delta
                            yield sse_event({'content': delta})
                        streamed_ok = True
                        break
                    except Exception as e:
                        print(f"❌ Groq stream error ({model_key}): {e}")
                        full_text = ''
                        continue

            if not streamed_ok:
                fb = fallback_response(user_message)
                for chunk in stream_fallback_text(fb):
                    full_text += chunk
                    yield sse_event({'content': chunk})

            if has_extra_materials:
                tip = "\n\n💡 **Tip:** Check the Materials section on the portal for more study resources!"
                full_text += tip
                yield sse_event({'content': tip})

            yield sse_event({'done': True, 'full_text': full_text})

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive',
            }
        )

    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        traceback.print_exc()

        def error_stream():
            msg = "I'm having a bit of trouble right now. Please try again in a moment! 🙏"
            yield sse_event({'content': msg})
            yield sse_event({'done': True, 'full_text': msg})

        return Response(stream_with_context(error_stream()), mimetype='text/event-stream')


@chatbot_bp.route('/chat/test', methods=['GET'])
def test_groq():
    if not GROQ_API_KEY:
        return jsonify({'success': False, 'error': 'GROQ_API_KEY not configured'})

    try:
        text = ''
        for delta in stream_groq(
            [{'role': 'user', 'content': "Say 'Hello! I am working!' in one sentence."}],
            GROQ_MODELS['balanced']
        ):
            text += delta
        return jsonify({'success': True, 'response': text})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})