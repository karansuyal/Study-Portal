import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const courses = [
    { value: 'BTech', label: 'B.Tech' },
    { value: 'BCA',   label: 'BCA' },
    { value: 'BBA',   label: 'BBA' },
    { value: 'MCA',   label: 'MCA' },
    { value: 'MBA',   label: 'MBA' },
    { value: 'Other', label: 'Other' }
  ];

  const btechBranches = [
    { value: 'CSE',        label: 'Computer Science' },
    { value: 'ECE',        label: 'Electronics & Comm.' },
    { value: 'EEE',        label: 'Electrical & Electronics' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Civil',      label: 'Civil' },
    { value: 'IT',         label: 'Information Technology' },
    { value: 'Other',      label: 'Other Branch' }
  ];

  const otherBranches = [
    { value: 'General',          label: 'General' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mathematics',      label: 'Mathematics' },
    { value: 'Physics',          label: 'Physics' },
    { value: 'Chemistry',        label: 'Chemistry' },
    { value: 'Commerce',         label: 'Commerce' },
    { value: 'Management',       label: 'Management' },
    { value: 'Other',            label: 'Other' }
  ];

  const semesters = ['1','2','3','4','5','6','7','8'];

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: 'transparent' };
    if (pw.length < 6)  return { score: 1, label: 'Too short', color: '#ef4444' };
    if (pw.length < 8)  return { score: 2, label: 'Weak',      color: '#f59e0b' };
    if (pw.length < 10) return { score: 3, label: 'Good',      color: '#10b981' };
    return                     { score: 4, label: 'Strong',    color: '#4338ca' };
  };
  const strength = getStrength(formData.password);

  useEffect(() => {
    const existing = document.getElementById('rg-styles');
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = 'rg-styles';
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.rg-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%);
  padding: 1.5rem 1rem 3rem;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

.rg-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 32px 72px rgba(0,0,0,.32);
  overflow: hidden;
  animation: rg-rise .45s cubic-bezier(.4,0,.2,1);
  position: relative;
  z-index: 1;
}

@keyframes rg-rise {
  from { opacity: 0; transform: translateY(24px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.rg-head {
  background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
  padding: 1.75rem 1.5rem 2.75rem;
  text-align: center;
  position: relative;
}
.rg-head::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0; height: 40px;
  background: #fff;
  border-radius: 55% 55% 0 0 / 100% 100% 0 0;
}
.rg-logo {
  width: 54px; height: 54px; border-radius: 50%;
  background: rgba(255,255,255,.15); border: 2px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin: 0 auto .85rem;
}
.rg-title {
  font-family: 'Sora', sans-serif; font-size: 1.45rem; font-weight: 700;
  color: #fff; letter-spacing: -.3px; margin-bottom: 4px;
}
.rg-sub { color: rgba(255,255,255,.75); font-size: .85rem; }

/* Step bar */
.rg-step-bar {
  display: flex; align-items: center; justify-content: center;
  padding: .9rem 1rem 0; gap: 0; overflow: hidden;
}
.rg-step-item { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.rg-step-num {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 600; font-family: 'Sora', sans-serif;
  border: 2px solid #e5e7eb; color: #9ca3af; background: #f9fafb;
  transition: .25s; flex-shrink: 0;
}
.rg-step-num.done   { background: #4338ca; border-color: #4338ca; color: #fff; }
.rg-step-num.active { background: #4338ca; border-color: #4338ca; color: #fff; box-shadow: 0 0 0 3px rgba(67,56,202,.18); }
.rg-step-lbl { font-size: .7rem; color: #9ca3af; font-weight: 500; white-space: nowrap; }
.rg-step-lbl.active { color: #4338ca; font-weight: 600; }
.rg-connector { height: 2px; width: 28px; background: #e5e7eb; margin: 0 4px; flex-shrink: 0; transition: .25s; }
.rg-connector.done { background: #4338ca; }

/* Body */
.rg-body { padding: 1.25rem 1.5rem 1.75rem; }

/* Alerts */
.rg-info {
  background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 10px;
  padding: .65rem .9rem; margin-bottom: 1.1rem;
  font-size: .8rem; color: #1d4ed8;
  display: flex; align-items: flex-start; gap: 7px; line-height: 1.5;
}
.rg-err {
  background: #fee2e2; border-left: 3px solid #dc2626; border-radius: 10px;
  padding: .65rem .9rem; margin-bottom: 1.1rem;
  font-size: .8rem; color: #b91c1c;
  display: flex; align-items: flex-start; gap: 7px;
}

/* Form */
.rg-grid { display: grid; gap: .9rem; }
.rg-row  { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; }

.rg-lbl { display: block; font-size: .76rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
.rg-req { color: #ef4444; margin-left: 2px; }

.rg-inp, .rg-sel {
  width: 100%; padding: .68rem .9rem;
  border: 1.5px solid #e5e7eb; border-radius: 11px;
  font-size: .88rem; font-family: 'DM Sans', sans-serif;
  color: #1e1b4b; background: #f9fafb; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  appearance: none; -webkit-appearance: none;
}
.rg-inp:focus, .rg-sel:focus {
  border-color: #4338ca; background: #fff;
  box-shadow: 0 0 0 3px rgba(67,56,202,.1);
}
.rg-sel-wrap { position: relative; }
.rg-sel-wrap::after {
  content: '▾'; position: absolute; right: 11px; top: 50%;
  transform: translateY(-50%); color: #9ca3af; font-size: .72rem; pointer-events: none;
}

.rg-pw-wrap { position: relative; }
.rg-pw-inp  { padding-right: 2.75rem; }
.rg-pw-btn  {
  position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: 15px; padding: 4px; line-height: 1; transition: color .2s;
}
.rg-pw-btn:hover { color: #4338ca; }

.rg-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.rg-bars     { display: flex; gap: 3px; flex: 1; }
.rg-bar      { height: 4px; flex: 1; border-radius: 3px; background: #e5e7eb; transition: background .3s; }
.rg-str-txt  { font-size: .7rem; color: #9ca3af; min-width: 48px; text-align: right; }
.rg-mismatch { font-size: .72rem; color: #ef4444; margin-top: 4px; }

/* Buttons */
.rg-actions { display: flex; gap: .65rem; margin-top: 1.25rem; }
.rg-btn {
  flex: 1; padding: .78rem; border: none; border-radius: 12px;
  font-family: 'Sora', sans-serif; font-size: .9rem; font-weight: 600;
  cursor: pointer; transition: transform .15s, box-shadow .2s, opacity .2s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.rg-btn-primary {
  background: linear-gradient(135deg, #4338ca, #6d28d9); color: #fff;
  box-shadow: 0 4px 14px rgba(67,56,202,.3);
}
.rg-btn-primary:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(67,56,202,.4); }
.rg-btn-primary:active:not(:disabled) { transform: scale(.98); }
.rg-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.rg-btn-ghost {
  background: #f3f4f6; color: #374151; border: 1.5px solid #e5e7eb;
  flex: 0 0 auto; padding: .78rem 1.1rem;
}
.rg-btn-ghost:hover { background: #e9e9f0; }

/* Process box */
.rg-process {
  background: #f8f7ff; border-radius: 12px;
  padding: .9rem 1.1rem; margin-top: 1rem;
  font-size: .78rem; color: #374151;
}
.rg-process h5 {
  color: #4338ca; font-family: 'Sora', sans-serif;
  font-size: .78rem; font-weight: 600; margin-bottom: .45rem;
}
.rg-process ol { padding-left: 1.15rem; color: #6b7280; line-height: 1.85; }

/* Footer */
.rg-footer { text-align: center; padding-top: 1rem; border-top: 1px solid #f3f4f6; margin-top: 1.1rem; }
.rg-footer p { font-size: .8rem; color: #9ca3af; margin-bottom: 3px; }
.rg-link { color: #4338ca; font-weight: 600; font-size: .85rem; text-decoration: none; }
.rg-link:hover { color: #6d28d9; }

/* Spinner */
.rg-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: rg-spin .7s linear infinite;
}
@keyframes rg-spin { to { transform: rotate(360deg); } }

/* Verification */
.rg-verify {
  width: 100%; max-width: 440px; background: #fff; border-radius: 24px;
  box-shadow: 0 32px 72px rgba(0,0,0,.32); overflow: hidden;
  animation: rg-rise .45s cubic-bezier(.4,0,.2,1); position: relative; z-index: 1;
}
.rg-verify-head {
  background: linear-gradient(135deg, #059669, #10b981);
  padding: 1.75rem 1.5rem 2.75rem; text-align: center; position: relative;
}
.rg-verify-head::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 40px;
  background: #fff; border-radius: 55% 55% 0 0 / 100% 100% 0 0;
}
.rg-check-ring {
  width: 62px; height: 62px; border-radius: 50%;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.32);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; margin: 0 auto .85rem;
}
.rg-verify-body { padding: 1.5rem; }
.rg-email-badge {
  background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px;
  padding: .6rem .9rem; margin: .85rem 0; text-align: center;
  font-size: .85rem; font-weight: 500; color: #065f46; word-break: break-all;
}
.rg-steps-box {
  background: #f8f7ff; border-radius: 12px; padding: .9rem 1.1rem; margin: .85rem 0;
}
.rg-steps-box h5 { color: #4338ca; font-family: 'Sora',sans-serif; font-size: .78rem; font-weight: 600; margin-bottom: .45rem; }
.rg-steps-box ol { padding-left: 1.15rem; color: #6b7280; font-size: .8rem; line-height: 1.85; }
.rg-verify-actions { display: flex; flex-direction: column; gap: .6rem; }
.rg-btn-green  { background: linear-gradient(135deg,#059669,#10b981); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,.28); }
.rg-btn-green:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.38); }
.rg-btn-outline { background: #fff; color: #4338ca; border: 1.5px solid #c7d2fe; }
.rg-btn-outline:hover { background: #f5f4ff; }

/* ─── MOBILE FIX ─── */
@media (max-width: 480px) {
  .rg-page { padding: 1rem .75rem 2.5rem; }
  .rg-head { padding: 1.5rem 1rem 2.5rem; }
  .rg-body { padding: 1rem 1rem 1.5rem; }

  /* Hide labels, shrink connectors → step numbers only */
  .rg-step-lbl  { display: none; }
  .rg-connector { width: 18px; margin: 0 3px; }
  .rg-step-bar  { padding: .7rem .75rem 0; }

  /* Stack two-column grids */
  .rg-row { grid-template-columns: 1fr; }

  .rg-btn  { font-size: .85rem; padding: .72rem; }
  .rg-title { font-size: 1.25rem; }
  .rg-logo  { width: 48px; height: 48px; font-size: 20px; }
}

@media (max-width: 360px) {
  .rg-connector { width: 12px; }
  .rg-step-num  { width: 24px; height: 24px; font-size: .65rem; }
}
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('rg-styles'); if (el) el.remove(); };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course') {
      setFormData(p => ({ ...p, course: value, branch: value === 'BTech' ? 'CSE' : 'General' }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim()) { setError('Please fill in all fields.'); return; }
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('https://study-portal-ill8.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, password: formData.password,
          course: formData.course, branch: formData.branch, semester: parseInt(formData.semester)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationEmail(data.user.email);
        setVerificationSent(true);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="rg-page">
        <div className="rg-verify">
          <div className="rg-verify-head">
            <div className="rg-check-ring">✓</div>
            <div style={{color:'#fff',fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:700,marginBottom:4}}>Account Created!</div>
            <div style={{color:'rgba(255,255,255,.75)',fontSize:'.83rem'}}>One last step — verify your email</div>
          </div>
          <div className="rg-verify-body">
            <p style={{fontSize:'.82rem',color:'#6b7280',textAlign:'center'}}>We've sent a verification link to:</p>
            <div className="rg-email-badge">{verificationEmail}</div>
            <div className="rg-steps-box">
              <h5>Next steps</h5>
              <ol>
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link</li>
                <li>Return and log in to your account</li>
                <li>Start uploading &amp; downloading materials</li>
              </ol>
            </div>
            <div className="rg-verify-actions">
              <button className="rg-btn rg-btn-green" onClick={() => navigate('/login')}>Go to Login</button>
              <button className="rg-btn rg-btn-outline" onClick={() => { setVerificationSent(false); setStep(1); }}>Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ['Personal', 'Academic', 'Security'];

  return (
    <div className="rg-page">
      <div className="rg-card">

        <div className="rg-head">
          <div className="rg-logo">📚</div>
          <h1 className="rg-title">Create Account</h1>
          <p className="rg-sub">Join the learning community</p>
        </div>

        {/* Step indicator */}
        <div className="rg-step-bar">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const isDone   = step > n;
            const isActive = step === n;
            return (
              <React.Fragment key={n}>
                {i > 0 && <div className={`rg-connector${isDone ? ' done' : ''}`} />}
                <div className="rg-step-item">
                  <div className={`rg-step-num${isDone ? ' done' : isActive ? ' active' : ''}`}>
                    {isDone ? '✓' : n}
                  </div>
                  <span className={`rg-step-lbl${isActive ? ' active' : ''}`}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="rg-body">

          <div className="rg-info">
            <span style={{flexShrink:0}}>ℹ</span>
            Verify your email after registration before logging in.
          </div>

          {error && (
            <div className="rg-err">
              <span style={{flexShrink:0}}>⚠</span> {error}
            </div>
          )}

          {/* Step 1 — Personal */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="rg-grid">
                <div>
                  <label className="rg-lbl">Full Name <span className="rg-req">*</span></label>
                  <input className="rg-inp" type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="e.g. Rahul Sharma" required />
                </div>
                <div>
                  <label className="rg-lbl">Email Address <span className="rg-req">*</span></label>
                  <input className="rg-inp" type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="student@example.com" required />
                </div>
              </div>
              <div className="rg-actions">
                <button type="submit" className="rg-btn rg-btn-primary">Continue →</button>
              </div>
              <div className="rg-footer">
                <p>Already have an account?</p>
                <Link to="/login" className="rg-link">Login here</Link>
              </div>
            </form>
          )}

          {/* Step 2 — Academic */}
          {step === 2 && (
            <form onSubmit={handleNext}>
              <div className="rg-grid">
                <div className="rg-row">
                  <div>
                    <label className="rg-lbl">Course <span className="rg-req">*</span></label>
                    <div className="rg-sel-wrap">
                      <select className="rg-sel" name="course" value={formData.course} onChange={handleChange} required>
                        {courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="rg-lbl">
                      {formData.course === 'BTech' ? 'Branch' : 'Specialization'} <span className="rg-req">*</span>
                    </label>
                    <div className="rg-sel-wrap">
                      <select className="rg-sel" name="branch" value={formData.branch} onChange={handleChange} required>
                        {(formData.course === 'BTech' ? btechBranches : otherBranches).map(b =>
                          <option key={b.value} value={b.value}>{b.label}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="rg-lbl">Current Semester <span className="rg-req">*</span></label>
                  <div className="rg-sel-wrap">
                    <select className="rg-sel" name="semester" value={formData.semester} onChange={handleChange} required>
                      {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="rg-actions">
                <button type="button" className="rg-btn rg-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="rg-btn rg-btn-primary">Continue →</button>
              </div>
            </form>
          )}

          {/* Step 3 — Security */}
          {step === 3 && (
            <form onSubmit={handleRegister}>
              <div className="rg-grid">
                <div className="rg-row">
                  <div>
                    <label className="rg-lbl">Password <span className="rg-req">*</span></label>
                    <div className="rg-pw-wrap">
                      <input className="rg-inp rg-pw-inp"
                        type={showPassword ? 'text' : 'password'}
                        name="password" value={formData.password}
                        onChange={handleChange} placeholder="Min. 6 characters" required />
                      <button type="button" className="rg-pw-btn" onClick={() => setShowPassword(v => !v)}>
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="rg-lbl">Confirm Password <span className="rg-req">*</span></label>
                    <div className="rg-pw-wrap">
                      <input className="rg-inp rg-pw-inp"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword" value={formData.confirmPassword}
                        onChange={handleChange} placeholder="Re-enter password" required />
                      <button type="button" className="rg-pw-btn" onClick={() => setShowConfirmPassword(v => !v)}>
                        {showConfirmPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.password && (
                  <div className="rg-strength">
                    <div className="rg-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="rg-bar"
                          style={{background: i <= strength.score ? strength.color : '#e5e7eb'}} />
                      ))}
                    </div>
                    <span className="rg-str-txt" style={{color: strength.color}}>{strength.label}</span>
                  </div>
                )}

                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="rg-mismatch">⚠ Passwords don't match</div>
                )}
              </div>

              <div className="rg-process">
                <h5>Registration Process</h5>
                <ol>
                  <li>Fill form with your course details</li>
                  <li>Verify your email (check inbox &amp; spam)</li>
                  <li>Login with your credentials</li>
                  <li>Start uploading / downloading materials</li>
                </ol>
              </div>

              <div className="rg-actions">
                <button type="button" className="rg-btn rg-btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="rg-btn rg-btn-primary" disabled={loading}>
                  {loading ? <><span className="rg-spinner" /> Creating...</> : 'Create Account'}
                </button>
              </div>

              <div className="rg-footer">
                <p>Already have an account?</p>
                <Link to="/login" className="rg-link">Login here</Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
