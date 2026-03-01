import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.access_token);
        alert(`✅ Welcome ${data.user.name}!`);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const useTestCredentials = () => {
    setFormData({
      email: 'student@test.com',
      password: 'student123'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease'
      }}>
        {/* Header with wave design */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: 0,
            width: '100%',
            height: '40px',
            background: 'white',
            borderTopLeftRadius: '50% 100%',
            borderTopRightRadius: '50% 100%',
          }}></div>
          
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: '700',
            marginBottom: '0.5rem',
            position: 'relative',
            zIndex: 1
          }}>
            📚 Study Portal
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            position: 'relative',
            zIndex: 1
          }}>
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Form Section */}
        <div style={{
          padding: '2rem 1.5rem'
        }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.95rem',
              border: '1px solid #fecaca',
              animation: 'shake 0.3s ease'
            }}>
              <span style={{ marginRight: '0.5rem' }}>❌</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="student@example.com"
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            {/* Remember & Forgot */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                <input type="checkbox" style={{
                  width: '1rem',
                  height: '1rem',
                  cursor: 'pointer'
                }} />
                Remember me
              </label>
              
              <Link to="/forgot-password" style={{
                color: '#4f46e5',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Forgot Password?
              </Link>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.3s ease',
                transform: loading ? 'none' : 'scale(1)',
                boxShadow: '0 4px 6px rgba(79, 70, 229, 0.25)'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '1.2rem',
                    height: '1.2rem',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
            
            {/* Test Credentials Button */}
            <button
              type="button"
              onClick={useTestCredentials}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#4f46e5',
                border: '2px dashed #4f46e5',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f5f3ff'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              🧪 Use Test Credentials
            </button>
          </form>
          
          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              color: '#6b7280',
              marginBottom: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Don't have an account?
            </p>
            <Link to="/register" style={{
              display: 'inline-block',
              color: '#4f46e5',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f5f3ff'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Create new account →
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;