"""AI chatbot (GroqCloud). Logic unchanged from original app.py, just moved into its own file."""

import os
import time
import json
import hashlib
import traceback
from collections import defaultdict

import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import User, Note, Subject

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api')

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

GROQ_MODELS = {
    'fast': 'llama-3.1-8b-instant',
    'balanced': 'llama-3.3-70b-versatile',
    'coding': 'qwen-2.5-coder-32b',
}

RATE_LIMIT_SECONDS = 2
CACHE_TTL = 300

cache = {}
cache_time = {}
last_request_time = defaultdict(float)


def get_cache_key(prompt):
    return hashlib.md5(prompt.encode()).hexdigest()


def get_from_cache(prompt):
    key = get_cache_key(prompt)
    if key in cache:
        if time.time() - cache_time[key] < CACHE_TTL:
            return cache[key]
    return None


def save_to_cache(prompt, response):
    key = get_cache_key(prompt)
    cache[key] = response
    cache_time[key] = time.time()


def is_rate_limited(user_id="global"):
    now = time.time()
    if now - last_request_time[user_id] < RATE_LIMIT_SECONDS:
        return True
    last_request_time[user_id] = now
    return False


def get_groq_response(prompt, model_name=GROQ_MODELS['balanced']):
    if not GROQ_API_KEY:
        return None

    if is_rate_limited():
        return "⏳ Too many requests. Please wait a second."

    cached = get_from_cache(prompt)
    if cached:
        return cached

    try:
        headers = {'Authorization': f'Bearer {GROQ_API_KEY}', 'Content-Type': 'application/json'}

        payload = {
            'model': model_name,
            'messages': [
                {'role': 'system', 'content': '''You are a helpful study assistant for Study Portal.

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

**Rules:**
- Keep responses helpful and educational
- Suggest checking Materials section for notes/PYQs
- Don't give wrong academic information
- Be positive and supportive'''},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7,
            'max_tokens': 1024,
            'top_p': 0.9,
            'stream': False
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content'].strip()
            save_to_cache(prompt, ai_response)
            return ai_response
        else:
            error_detail = response.json() if response.text else {}
            error_msg = error_detail.get('error', {}).get('message', 'Unknown error')
            print(f"❌ Groq API Error {response.status_code}: {error_msg}")

            if response.status_code == 429:
                return "⏳ API rate limit reached. Please try again in a few seconds."

            return None

    except requests.exceptions.Timeout:
        print("⏰ Groq API timeout")
        return None
    except Exception as e:
        print(f"❌ Groq API exception: {str(e)}")
        return None


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


@chatbot_bp.route('/chat', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def chat_with_ai():
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200

    try:
        user_id = get_jwt_identity()
        user_context = None

        if user_id:
            user = db.session.get(User, int(user_id))
            if user:
                user_context = get_user_context(user.id)

        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        search_results = search_knowledge_base(user_message, user_id)

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
            prompt = f"""**Student Profile:**
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
        else:
            prompt = f"""**About Study Portal:**
- Created by Karan Suyal
- Free study materials for students
- Website: study-portal-app.vercel.app

**Relevant Materials from Portal:**
{context if context else "No specific materials found."}

**Student's Question:** {user_message}

**Instructions:**
1. Be friendly and helpful 
2. Give concise answers (max 150 words)
3. If asked "who created this" or "who made study portal", say it was created by Karan Suyal
4. Suggest checking the study portal for more resources

**Your Response:**"""

        ai_response = None

        if GROQ_API_KEY:
            ai_response = get_groq_response(prompt, GROQ_MODELS['balanced'])
            if not ai_response:
                ai_response = get_groq_response(prompt, GROQ_MODELS['fast'])

        if not ai_response:
            ai_response = fallback_response(user_message, context)

        if search_results['notes'] or search_results['pyqs']:
            ai_response += "\n\n💡 **Tip:** Check the Materials section on the portal for more study resources!"

        return jsonify({'success': True, 'response': ai_response})

    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': True, 'response': "I'm having a bit of trouble right now. Please try again in a moment! 🙏"})


def fallback_response(question, context):
    question_lower = question.lower()

    if 'who made' in question_lower or 'who created' in question_lower or 'who built' in question_lower:
        return "👨‍💻 **Study Portal** was created by **Karan Suyal**! It's a platform for free study materials including notes, PYQs, syllabus, and lab manuals for students."

    if 'notes' in question_lower or 'study material' in question_lower:
        return "📚 You can find study materials in the **Materials** section! Browse by course, year, and semester to access notes, PYQs, and syllabus."

    elif 'pyq' in question_lower or 'previous year' in question_lower:
        return "📝 Previous Year Questions are available in the Materials section. Select your course and subject to find PYQs for exam preparation!"

    elif 'exam' in question_lower or 'prepare' in question_lower:
        return "🎯 Exam preparation tips:\n• Review all PYQs\n• Make short notes\n• Practice regularly\n• Check the syllabus for important topics\n\nGood luck with your exams! 💪"

    elif 'syllabus' in question_lower:
        return "📋 Syllabus for all courses is available in the Materials section. Select your course, year, and semester to find the complete syllabus."

    elif 'dark mode' in question_lower:
        return "🌙 Dark mode is available! Look for the moon/sun icon in the navbar or at the bottom right corner to toggle between light and dark themes."

    else:
        return "👋 Hi there! I'm your study assistant. You can ask me about:\n\n📚 Notes & Study Materials\n📝 Previous Year Questions (PYQs)\n📋 Syllabus\n🎯 Exam Preparation\n🌙 Dark Mode\n\nWhat would you like to know?"


@chatbot_bp.route('/chat/test', methods=['GET'])
def test_groq():
    if not GROQ_API_KEY:
        return jsonify({'success': False, 'error': 'GROQ_API_KEY not configured'})

    test_response = get_groq_response("Say 'Hello! I am working!' in one sentence.")

    if test_response:
        return jsonify({'success': True, 'response': test_response})
    else:
        return jsonify({'success': False, 'error': 'Groq API not responding'})
