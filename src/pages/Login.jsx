import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

      * { box-sizing: border-box; }

      .sp-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%);
        padding: 1rem;
        font-family: 'DM Sans', sans-serif;
        position: relative;
        overflow: hidden;
      }

      .sp-page::before {
        content: '';
        position: absolute;
        top: -200px; left: -200px;
        width: 500px; height: 500px;
        background: radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%);
        pointer-events: none;
      }

      .sp-page::after {
        content: '';
        position: absolute;
        bottom: -150px; right: -150px;
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%);
        pointer-events: none;
      }

      .sp-card {
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
        overflow: hidden;
        animation: sp-rise 0.5s cubic-bezier(0.4,0,0.2,1);
        position: relative;
        z-index: 1;
      }

      @keyframes sp-rise {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .sp-header {
        background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
        padding: 2.25rem 1.75rem 3rem;
        text-align: center;
        position: relative;
      }

      .sp-header::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0;
        height: 44px;
        background: #ffffff;
        border-radius: 55% 55% 0 0 / 100% 100% 0 0;
      }

      .sp-logo {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px;
        margin: 0 auto 1rem;
        backdrop-filter: blur(4px);
      }

      .sp-title {
        color: #fff;
        font-family: 'Sora', sans-serif;
        font-size: 1.55rem;
        font-weight: 700;
        margin: 0 0 6px;
        letter-spacing: -0.3px;
      }

      .sp-subtitle {
        color: rgba(255,255,255,0.78);
        font-size: 0.88rem;
        margin: 0;
      }

      .sp-body {
        padding: 1.75rem;
      }

      .sp-error {
        background: #fee2e2;
        border-left: 3px solid #dc2626;
        color: #b91c1c;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.85rem;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sp-field { margin-bottom: 1.15rem; }

      .sp-label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 7px;
      }

      .sp-label-icon { font-size: 13px; color: #818cf8; }

      .sp-input-wrap { position: relative; }

      .sp-input {
        width: 100%;
        padding: 0.78rem 1rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 12px;
        font-size: 0.92rem;
        font-family: 'DM Sans', sans-serif;
        color: #1e1b4b;
        background: #f9fafb;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      }

      .sp-input:focus {
        border-color: #4338ca;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(67,56,202,0.1);
      }

      .sp-input.has-toggle { padding-right: 3rem; }

      .sp-toggle {
        position: absolute;
        right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; cursor: pointer;
        color: #9ca3af; font-size: 17px; padding: 4px;
        line-height: 1;
        transition: color 0.2s;
      }
      .sp-toggle:hover { color: #4338ca; }

      .sp-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.4rem;
      }

      .sp-check-lbl {
        display: flex; align-items: center; gap: 7px;
        font-size: 0.82rem; color: #6b7280; cursor: pointer;
      }

      .sp-check {
        width: 15px; height: 15px;
        accent-color: #4338ca;
        cursor: pointer;
      }

      .sp-forgot {
        font-size: 0.82rem;
        color: #4338ca;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }
      .sp-forgot:hover { color: #6d28d9; text-decoration: underline; }

      .sp-btn {
        width: 100%;
        padding: 0.85rem;
        background: linear-gradient(135deg, #4338ca, #6d28d9);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-family: 'Sora', sans-serif;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        letter-spacing: 0.3px;
        transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        box-shadow: 0 4px 14px rgba(67,56,202,0.35);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .sp-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(67,56,202,0.45);
      }
      .sp-btn:active:not(:disabled) { transform: scale(0.98); }
      .sp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

      .sp-spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: sp-spin 0.7s linear infinite;
      }
      @keyframes sp-spin { to { transform: rotate(360deg); } }

      .sp-divider {
        display: flex; align-items: center; gap: 10px;
        margin: 0.2rem 0 0.9rem;
      }
      .sp-div-line { flex: 1; height: 1px; background: #e5e7eb; }
      .sp-div-txt { font-size: 0.75rem; color: #9ca3af; }

      .sp-google-btn {
        width: 100%;
        padding: 0.78rem;
        background: #fff;
        color: #374151;
        border: 1.5px solid #e5e7eb;
        border-radius: 12px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.92rem;
        font-weight: 500;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        margin-bottom: 1rem;
      }
      .sp-google-btn:hover {
        border-color: #4338ca;
        background: #f5f4ff;
        box-shadow: 0 2px 8px rgba(67,56,202,0.1);
      }

      .sp-footer {
        text-align: center;
        padding-top: 1rem;
        border-top: 1px solid #f3f4f6;
      }
      .sp-footer p { font-size: 0.82rem; color: #9ca3af; margin: 0 0 5px; }
      .sp-register-link {
        color: #4338ca;
        font-weight: 600;
        font-size: 0.88rem;
        text-decoration: none;
        transition: color 0.2s;
      }
      .sp-register-link:hover { color: #6d28d9; }

      .sp-toast {
        position: fixed;
        top: 20px; right: 20px;
        background: #10b981;
        color: #fff;
        padding: 12px 18px;
        border-radius: 12px;
        display: flex; align-items: center; gap: 9px;
        font-size: 0.85rem;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 4px 16px rgba(16,185,129,0.35);
        z-index: 9999;
        transform: translateX(calc(100% + 24px));
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      }
      .sp-toast.sp-toast-show { transform: translateX(0); }

      @media (max-width: 480px) {
        .sp-card { border-radius: 20px; }
        .sp-header { padding: 1.75rem 1.25rem 2.5rem; }
        .sp-body { padding: 1.25rem; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.access_token);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => navigate('/'), 1200);
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://study-portal-ill8.onrender.com/api/auth/google';
  };

  return (
    <div className="sp-page">
      <div className={`sp-toast${showToast ? ' sp-toast-show' : ''}`}>
        ✓ Login successful! Redirecting...
      </div>

      <div className="sp-card">
        <div className="sp-header">
          <div className="sp-logo">📚</div>
          <h1 className="sp-title">Study Portal</h1>
          <p className="sp-subtitle">Welcome back! Please login.</p>
        </div>

        <div className="sp-body">
          {error && (
            <div className="sp-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="sp-field">
              <label className="sp-label">
                <span className="sp-label-icon">✉</span> Email
              </label>
              <input
                className="sp-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div className="sp-field">
              <label className="sp-label">
                <span className="sp-label-icon">🔒</span> Password
              </label>
              <div className="sp-input-wrap">
                <input
                  className="sp-input has-toggle"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                />
                <button
                  type="button"
                  className="sp-toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="sp-row">
              <label className="sp-check-lbl">
                <input type="checkbox" className="sp-check" />
                Remember me
              </label>
              <Link to="/forgot-password" className="sp-forgot">Forgot password?</Link>
            </div>

            <button type="submit" className="sp-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="sp-spinner"></span>
                  Logging in...
                </>
              ) : 'Login'}
            </button>

            <div className="sp-divider">
              <div className="sp-div-line" />
              <span className="sp-div-txt">OR</span>
              <div className="sp-div-line" />
            </div>

            <button type="button" className="sp-google-btn" onClick={handleGoogleLogin}>
              <FaGoogle style={{ color: '#DB4437', fontSize: '1.1rem' }} />
              Sign in with Google
            </button>
          </form>

          <div className="sp-footer">
            <p>Don't have an account?</p>
            <Link to="/register" className="sp-register-link">Create new account →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
