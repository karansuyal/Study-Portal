// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaUserGraduate } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: "Hello Bro! 👋 I'm your AI study assistant powered by Google Gemini.\n\nAsk me anything about:\n📚 Your courses\n📝 Exam preparation\n🎯 Study tips\n📖 Subject doubts\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('study_portal_token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://study-portal-ill8.onrender.com/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "Sorry, I encountered an error. Please try again! 🙏" 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "Connection error. Please check your internet and try again! 🌐" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
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
                <p>Powered by Google Gemini</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.role === 'bot' && <FaRobot className="message-icon bot-icon" />}
                  {msg.role === 'user' && <FaUserGraduate className="message-icon user-icon" />}
                  <div className="message-text">
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <FaSpinner className="spinner" />
                  <div className="message-text">
                    <p>Thinking... 🤔</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me anything about your studies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;