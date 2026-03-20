import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: 'BTech',
    branch: 'CSE',
    semester: '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const courses = [
    { value: 'BTech', label: '🎓 B.Tech (Bachelor of Technology)' },
    { value: 'BCA', label: '💻 BCA (Bachelor of Computer Applications)' },
    { value: 'BBA', label: '📊 BBA (Bachelor of Business Administration)' },
    { value: 'MCA', label: '🚀 MCA (Master of Computer Applications)' },
    { value: 'MBA', label: '💼 MBA (Master of Business Administration)' },
    { value: 'Other', label: '📚 Other Course' }
  ];

  const btechBranches = [
    { value: 'CSE', label: '💻 Computer Science Engineering' },
    { value: 'ECE', label: '📡 Electronics & Communication' },
    { value: 'EEE', label: '⚡ Electrical & Electronics' },
    { value: 'Mechanical', label: '🔧 Mechanical Engineering' },
    { value: 'Civil', label: '🏗️ Civil Engineering' },
    { value: 'IT', label: '🌐 Information Technology' },
    { value: 'Other', label: '🔄 Other Branch' }
  ];
  
  const otherCourseBranches = [
    { value: 'General', label: '📚 General' },
    { value: 'Computer Science', label: '💻 Computer Science' },
    { value: 'Mathematics', label: '📐 Mathematics' },
    { value: 'Physics', label: '⚛️ Physics' },
    { value: 'Chemistry', label: '🧪 Chemistry' },
    { value: 'Commerce', label: '💰 Commerce' },
    { value: 'Management', label: '📊 Management' },
    { value: 'Other', label: '🔄 Other' }
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/register', {
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
        setVerificationSent(true);
        setVerificationEmail(data.user.email);
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

  if (verificationSent) {
    return (
      <div className="register-container">
        <div className="verification-card">
          <div className="verification-icon">📧</div>
          <h2 className="verification-title">Verify Your Email</h2>
          <p className="verification-text">
            We've sent a verification link to:<br />
            <strong>{verificationEmail}</strong>
          </p>
          
          <div className="verification-steps">
            <h4>📌 Next Steps:</h4>
            <ol>
              <li>Check your inbox (and spam folder)</li>
              <li>Click the verification link</li>
              <li>Return here and login</li>
            </ol>
          </div>

          <div className="verification-actions">
            <Link to="/login" className="btn-primary">
              🔐 Go to Login Page
            </Link>
          </div>

          <div className="verification-footer">
            <p>Didn't receive email?</p>
            <div className="footer-buttons">
              <button
                onClick={() => setVerificationSent(false)}
                className="btn-outline"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join our learning community today</p>
        </div>

        {/* Info Note */}
        <div className="info-note">
          <span className="info-icon">📧</span>
          <p>After registration, please verify your email before logging in.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="register-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="student@example.com"
            />
          </div>

          {/* Course & Branch Row */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">
                Course <span className="required">*</span>
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="form-select"
                required
              >
                {courses.map(course => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label className="form-label">
                {formData.course === 'BTech' ? 'Branch' : 'Specialization'} <span className="required">*</span>
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="form-select"
                required
              >
                {(formData.course === 'BTech' ? btechBranches : otherCourseBranches).map(item => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester */}
          <div className="form-group">
            <label className="form-label">
              Current Semester <span className="required">*</span>
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="form-select"
              required
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Password Row */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input password-input"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group half">
              <label className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input password-input"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`strength-bar ${
                      formData.password.length >= bar * 2 ? 'active' : ''
                    }`}
                  ></div>
                ))}
              </div>
              <span className="strength-text">
                {formData.password.length < 6 ? 'Too short' :
                 formData.password.length < 8 ? 'Weak' :
                 formData.password.length < 10 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link-text">
              Login here
            </Link>
          </p>
        </div>

        {/* Registration Process Info */}
        <div className="process-info">
          <h4>📋 Registration Process:</h4>
          <ol>
            <li>Fill registration form with your course details</li>
            <li>Verify your email (check inbox)</li>
            <li>Login with your credentials</li>
            <li>Start uploading/downloading materials</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Register;