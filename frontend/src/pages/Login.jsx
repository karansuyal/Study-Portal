import React, { useState, useEffect } from 'react';
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
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Check connection.');
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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.wave}></div>
          <h1 style={styles.title}>📚 Study Portal</h1>
          <p style={styles.subtitle}>Welcome back! Please login</p>
        </div>

        {/* Form */}
        <div style={styles.formContainer}>
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
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
            
            {/* Password */}
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
            
            {/* Remember & Forgot */}
            <div style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            
            {/* Login Button */}
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
            
            {/* Test Credentials */}
            <button
              type="button"
              onClick={useTestCredentials}
              style={styles.testButton}
            >
              🧪 Use Test Credentials
            </button>
          </form>
          
          {/* Register Link */}
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

// Optimized styles - no animations, no transitions
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem'
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
    textAlign: 'center',
    fontSize: '0.95rem'
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
    color: '#374151',
    fontSize: '0.95rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
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
    fontSize: '0.9rem',
    fontWeight: '500'
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
    marginBottom: '1rem',
    boxShadow: '0 4px 6px rgba(79, 70, 229, 0.25)'
  },
  buttonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7
  },
  testButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    color: '#4f46e5',
    border: '2px dashed #4f46e5',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1.5rem'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    color: '#6b7280',
    marginBottom: '0.5rem',
    fontSize: '0.95rem'
  },
  registerLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    display: 'inline-block',
    padding: '0.5rem 1rem'
  }
};

export default Login;
