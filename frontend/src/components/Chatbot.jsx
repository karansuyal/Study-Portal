// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaRobot, FaTimes, FaPaperPlane, FaUserGraduate,
  FaRegCopy, FaCheck, FaTrash, FaChevronDown, FaRedo
} from 'react-icons/fa';
import config from '../config/config.jsx';
import './Chatbot.css';

const API_BASE = config.API_BASE_URL;
const STORAGE_KEY = 'study_portal_chat_history';
const MAX_STORED_MESSAGES = 50;
const MAX_HISTORY_SENT = 20;

const QUICK_REPLIES = [
  { label: '📚 Find notes', text: 'Where can I find notes for my subjects?' },
  { label: '📝 PYQs', text: 'How can I access previous year questions?' },
  { label: '🎯 Exam tips', text: 'Give me some exam preparation tips.' },
  { label: '🌙 Dark mode', text: 'How do I enable dark mode?' },
];

const GREETING = {
  role: 'bot',
  text: "Hello! 👋 I'm your AI study assistant.\n\nAsk me anything about:\n- 📚 Your courses\n- 📝 Exam preparation\n- 🎯 Study tips\n- 📖 Subject doubts\n\nHow can I help you today?",
  time: new Date().toISOString(),
};

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
};

// ---------- tiny markdown renderer (no external deps) ----------
// Supports: **bold**, `inline code`, ```code blocks```, - / * lists, 1. numbered lists, paragraphs.
function formatInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return <strong key={`${keyPrefix}-b-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return <code key={`${keyPrefix}-c-${i}`} className="inline-code">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
}

function renderMarkdown(text) {
  if (!text) return null;

  // Split out fenced code blocks first
  const segments = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let segKey = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1], content: match[2].replace(/\n$/, '') });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  const nodes = [];

  segments.forEach((seg) => {
    segKey += 1;
    if (seg.type === 'code') {
      nodes.push(
        <pre key={`code-${segKey}`} className="md-code-block">
          <code>{seg.content}</code>
        </pre>
      );
      return;
    }

    // Process plain-text segment line by line, grouping lists & paragraphs
    const lines = seg.content.split('\n');
    let listBuffer = [];
    let listType = null; // 'ul' | 'ol'
    let paraBuffer = [];

    const flushList = () => {
      if (listBuffer.length === 0) return;
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      segKey += 1;
      nodes.push(
        <ListTag key={`list-${segKey}`} className="md-list">
          {listBuffer.map((item, i) => (
            <li key={i}>{formatInline(item, `li-${segKey}-${i}`)}</li>
          ))}
        </ListTag>
      );
      listBuffer = [];
      listType = null;
    };

    const flushPara = () => {
      if (paraBuffer.length === 0) return;
      segKey += 1;
      nodes.push(
        <p key={`p-${segKey}`}>
          {paraBuffer.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {formatInline(line, `p-${segKey}-${i}`)}
            </React.Fragment>
          ))}
        </p>
      );
      paraBuffer = [];
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (trimmed === '') {
        flushList();
        flushPara();
        return;
      }

      const ulMatch = /^[-*]\s+(.*)$/.exec(trimmed);
      const olMatch = /^\d+\.\s+(.*)$/.exec(trimmed);

      if (ulMatch) {
        flushPara();
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        listBuffer.push(ulMatch[1]);
        return;
      }
      if (olMatch) {
        flushPara();
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        listBuffer.push(olMatch[1]);
        return;
      }

      flushList();
      paraBuffer.push(trimmed);
    });

    flushList();
    flushPara();
  });

  return nodes;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore corrupt storage
    }
    return [GREETING];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const autoScrollRef = useRef(true);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    } catch {
      // storage full / unavailable — non-fatal
    }
  }, [messages]);

  useEffect(() => {
    if (autoScrollRef.current) scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 60;
    autoScrollRef.current = atBottom;
    setShowScrollBtn(!atBottom);
  };

  const handleScrollBtnClick = () => {
    autoScrollRef.current = true;
    setShowScrollBtn(false);
    scrollToBottom();
  };

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  const buildHistoryPayload = useCallback((priorMessages) => {
    return priorMessages
      .filter((m) => !m.error)
      .slice(-MAX_HISTORY_SENT)
      .map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));
  }, []);

  const streamBotReply = useCallback(async (userText, priorMessages) => {
    setLoading(true);
    const botMsgId = nextId();

    setMessages((prev) => [
      ...prev,
      { id: botMsgId, role: 'bot', text: '', time: new Date().toISOString(), streaming: true },
    ]);

    const history = buildHistoryPayload(priorMessages);

    try {
      const token = localStorage.getItem('study_portal_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userText, history }),
      });

      if (!response.ok || !response.body) {
        let errMsg = 'Something went wrong. Please try again.';
        try {
          const errJson = await response.json();
          if (errJson.error) errMsg = errJson.error;
        } catch {
          // response wasn't JSON — keep default message
        }
        throw new Error(errMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop();

        for (const rawChunk of chunks) {
          const line = rawChunk.trim();
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          let data;
          try {
            data = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (data.content) {
            fullText += data.content;
            const snapshot = fullText;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: snapshot } : m))
            );
          }
          if (data.done) {
            const finalText = data.full_text || fullText;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: finalText, streaming: false } : m))
            );
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, streaming: false } : m))
      );
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: err.message || 'Connection error. Please check your internet and try again! 🌐',
                streaming: false,
                error: true,
                retryText: userText,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [buildHistoryPayload]);

  const sendMessage = useCallback(
    (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      setInput('');
      requestAnimationFrame(autoResizeTextarea);

      const priorMessages = messagesRef.current;
      const userMsg = { id: nextId(), role: 'user', text, time: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);

      streamBotReply(text, priorMessages);
    },
    [input, loading, streamBotReply]
  );

  const handleRetry = (failedMsgId, retryText) => {
    const priorMessages = messagesRef.current.filter((m) => m.id !== failedMsgId);
    setMessages(priorMessages);
    streamBotReply(retryText, priorMessages.filter((m) => m.role !== 'bot' || !m.error));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClearChat = () => {
    setMessages([{ ...GREETING, id: nextId(), time: new Date().toISOString() }]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <FaRobot className="header-icon" />
              <div>
                <h3>AI Study Assistant</h3>
                <p>⚡ Powered by Llama (Groq)</p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button className="icon-btn" title="Clear chat" onClick={handleClearChat}>
                <FaTrash />
              </button>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>
          </div>

          <div
            className="chatbot-messages"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role} ${msg.error ? 'has-error' : ''}`}>
                <div className="message-content">
                  {msg.role === 'bot' && <FaRobot className="message-icon bot-icon" />}
                  {msg.role === 'user' && <FaUserGraduate className="message-icon user-icon" />}
                  <div className="message-body">
                    <div className="message-text">
                      {msg.role === 'bot' && msg.streaming && msg.text === '' ? (
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                      ) : (
                        <>
                          {renderMarkdown(msg.text)}
                          {msg.streaming && msg.text !== '' && <span className="stream-cursor">▍</span>}
                        </>
                      )}
                    </div>

                    {!msg.streaming && (
                      <div className="message-meta">
                        {msg.time && <span className="message-time">{formatTime(msg.time)}</span>}
                        {msg.role === 'bot' && !msg.error && msg.text && (
                          <button
                            className="copy-btn"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy"
                          >
                            {copiedId === msg.id ? <FaCheck /> : <FaRegCopy />}
                          </button>
                        )}
                        {msg.error && (
                          <button
                            className="retry-btn"
                            onClick={() => handleRetry(msg.id, msg.retryText)}
                            title="Retry"
                          >
                            <FaRedo /> Retry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showScrollBtn && (
            <button className="scroll-bottom-btn" onClick={handleScrollBtnClick}>
              <FaChevronDown />
            </button>
          )}

          <div className="quick-replies">
            {QUICK_REPLIES.map((chip) => (
              <button
                key={chip.label}
                className="quick-reply-chip"
                disabled={loading}
                onClick={() => sendMessage(chip.text)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="chatbot-input">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask me anything about your studies... (Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
