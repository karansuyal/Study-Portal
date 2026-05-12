import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showSuccessMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
        showSuccessMessage(); 
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://study-portal-ill8.onrender.com/api/auth/google';
  };

  return (
    <div style={styles.container}>
      {/*  SUCCESS TOAST */}
      {showToast && (
        <div style={styles.toast}>
          <span style={styles.toastIcon}></span>
          <span style={styles.toastText}>Login successful! Redirecting...</span>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.wave}></div>
          <h1 style={styles.title}>📚 Study Portal</h1>
          <p style={styles.subtitle}>Welcome back! Please login</p>
        </div>

        <div style={styles.formContainer}>
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>📧 Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="student@example.com"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>🔒 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
            
            <div style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
                background: loading ? '#9ca3af' : '#4f46e5'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div style={styles.divider}>
              <span>OR</span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={styles.googleButton}
            >
              <FaGoogle style={styles.googleIcon} />
              Sign in with Google
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>Don't have an account?</p>
            <Link to="/register" style={styles.registerLink}>
              Create new account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    position: 'relative'
  },
  
  toast: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    background: '#10b981',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease'
  },
  toastIcon: {
    fontSize: '18px'
  },
  toastText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: '2rem 1.5rem 2.5rem',
    textAlign: 'center',
    position: 'relative'
  },
  wave: {
    position: 'absolute',
    bottom: '-20px',
    left: 0,
    width: '100%',
    height: '40px',
    background: 'white',
    borderTopLeftRadius: '50% 100%',
    borderTopRightRadius: '50% 100%'
  },
  title: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    position: 'relative',
    zIndex: 1
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1rem',
    position: 'relative',
    zIndex: 1
  },
  formContainer: {
    padding: '2rem 1.5rem'
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  form: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: '1.25rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  checkbox: {
    width: '1rem',
    height: '1rem'
  },
  forgotLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  button: {
    width: '100%',
    padding: '0.875rem',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  buttonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7
  },
  divider: {
    textAlign: 'center',
    margin: '1rem 0',
    position: 'relative'
  },
  googleButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'white',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  googleIcon: {
    color: '#DB4437',
    fontSize: '1.2rem'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    color: '#6b7280',
    marginBottom: '0.5rem'
  },
  registerLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

// Add animation to head (if not already present)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;