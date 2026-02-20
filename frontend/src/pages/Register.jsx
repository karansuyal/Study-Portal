import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: 'BTech', // Default course
    branch: 'CSE',   // Default branch for BTech
    semester: '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();

  // Courses list (Sirf BTech aur other courses)
  const courses = [
    'BTech',
    'BCA',
    'BBA',
    'MCA',
    'MBA',
    'Other'
  ];

  // Branches only for BTech
  const btechBranches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'Other'];
  
  // For other courses, branch field can be hidden or show general subjects
  const otherCourseBranches = ['General', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Other'];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset branch when course changes
    if (name === 'course') {
      let defaultBranch = 'CSE';
      if (value !== 'BTech') {
        defaultBranch = 'General';
      }
      setFormData({
        ...formData,
        [name]: value,
        branch: defaultBranch
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setVerificationSent(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          course: formData.course,
          branch: formData.branch,
          semester: parseInt(formData.semester)
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show verification message
        setVerificationSent(true);
        setVerificationEmail(data.user.email);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          course: 'BTech',
          branch: 'CSE',
          semester: '1'
        });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    card: {
      width: '100%',
      background: 'white',
      padding: '2.5rem',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    title: {
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#1f2937',
      fontSize: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      transition: 'border 0.3s',
      outline: 'none',
      '&:focus': {
        borderColor: '#4f46e5',
        boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
      }
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      background: 'white',
      outline: 'none',
      '&:focus': {
        borderColor: '#4f46e5'
      }
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      background: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '1rem',
      transition: 'all 0.3s',
      '&:hover': {
        background: '#4338ca',
        transform: 'translateY(-2px)'
      },
      '&:disabled': {
        background: '#9ca3af',
        cursor: 'not-allowed',
        transform: 'none'
      }
    },
    error: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    verificationCard: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      marginBottom: '2rem',
      border: '2px solid #3b82f6'
    },
    icon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#6b7280'
    },
    link: {
      color: '#4f46e5',
      textDecoration: 'none',
      fontWeight: '500'
    },
    loginButton: {
      display: 'inline-block',
      background: '#10b981',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '500',
      marginTop: '1rem',
      transition: 'all 0.3s',
      '&:hover': {
        background: '#059669',
        transform: 'scale(1.05)'
      }
    }
  };

  // VERIFICATION SENT STATE
  if (verificationSent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.verificationCard}>
            <div style={styles.icon}>📧</div>
            <h2 style={{ color: '#1e3a8a', marginBottom: '0.5rem' }}>Verify Your Email</h2>
            <p style={{ color: '#1e40af', marginBottom: '1.5rem' }}>
              We've sent a verification link to:<br />
              <strong>{verificationEmail}</strong>
            </p>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                <strong>📌 Next Steps:</strong>
              </p>
              <ol style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link</li>
                <li>Return here and login</li>
              </ol>
            </div>
            <Link to="/login" style={styles.loginButton}>
              🔐 Go to Login Page
            </Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Didn't receive email?
            </p>
            <button
              onClick={() => setVerificationSent(false)}
              style={{
                background: 'transparent',
                color: '#4f46e5',
                border: '1px solid #4f46e5',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Create Account</h2>
        
        <div style={{
          background: '#f0f9ff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          borderLeft: '4px solid #0ea5e9'
        }}>
          <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
            <strong>Note:</strong> After registration, please verify your email before logging in.
          </p>
        </div>
        
        {error && (
          <div style={styles.error}>❌ {error}</div>
        )}
        
        <form onSubmit={handleRegister}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your full name"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
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
          
          {/* Course Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Course *</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              style={styles.select}
              required
            >
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          
          {/* Branch/Subject Selection - Changes based on course */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              {formData.course === 'BTech' ? 'Branch *' : 'Subject/Specialization *'}
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              style={styles.select}
              required
            >
              {(formData.course === 'BTech' ? btechBranches : otherCourseBranches).map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            {formData.course !== 'BTech' && (
              <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                Select your specialization or subject area
              </small>
            )}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Semester/Year *</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              style={styles.select}
              required
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="At least 6 characters"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Re-enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              background: loading ? '#9ca3af' : '#4f46e5'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={styles.loginLink}>
          <p>Already have an account? <Link to="/login" style={styles.link}>Login here</Link></p>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#6b7280'
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>📋 Registration Process:</p>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Fill registration form with your course details</li>
            <li>Verify your email (check inbox)</li>
            <li>Login with your credentials</li>
            <li>Start uploading/downloading</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Register;