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
    { value: 'BTech', label: 'B.Tech — Bachelor of Technology' },
    { value: 'BCA',   label: 'BCA — Bachelor of Computer Applications' },
    { value: 'BBA',   label: 'BBA — Bachelor of Business Administration' },
    { value: 'MCA',   label: 'MCA — Master of Computer Applications' },
    { value: 'MBA',   label: 'MBA — Master of Business Administration' },
    { value: 'Other', label: 'Other Course' }
  ];

  const btechBranches = [
    { value: 'CSE',        label: 'Computer Science Engineering' },
    { value: 'ECE',        label: 'Electronics & Communication' },
    { value: 'EEE',        label: 'Electrical & Electronics' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Civil',      label: 'Civil Engineering' },
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
    const style = document.createElement('style');
    style.id = 'rg-styles';
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.rg-page{
  min-height:100vh;display:flex;align-items:flex-start;justify-content:center;
  background:linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#4c1d95 100%);
  padding:2rem 1rem;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;
}
.rg-page::before{
  content:'';position:absolute;top:-180px;left:-180px;
  width:480px;height:480px;
  background:radial-gradient(circle,rgba(129,140,248,.14) 0%,transparent 70%);
  pointer-events:none;
}
.rg-page::after{
  content:'';position:absolute;bottom:-140px;right:-140px;
  width:420px;height:420px;
  background:radial-gradient(circle,rgba(167,139,250,.11) 0%,transparent 70%);
  pointer-events:none;
}
.rg-card{
  width:100%;max-width:600px;background:#fff;border-radius:24px;
  box-shadow:0 32px 72px rgba(0,0,0,.32),0 0 0 1px rgba(255,255,255,.06);
  overflow:hidden;animation:rg-rise .5s cubic-bezier(.4,0,.2,1);
  position:relative;z-index:1;margin-bottom:2rem;
}
@keyframes rg-rise{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.rg-head{
  background:linear-gradient(135deg,#4338ca 0%,#6d28d9 100%);
  padding:2rem 2rem 2.75rem;text-align:center;position:relative;
}
.rg-head::after{
  content:'';position:absolute;bottom:-1px;left:0;right:0;height:44px;
  background:#fff;border-radius:55% 55% 0 0/100% 100% 0 0;
}
.rg-logo{
  width:58px;height:58px;border-radius:50%;
  background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.28);
  display:flex;align-items:center;justify-content:center;font-size:26px;
  margin:0 auto 1rem;
}
.rg-title{
  font-family:'Sora',sans-serif;font-size:1.5rem;font-weight:700;
  color:#fff;margin-bottom:4px;letter-spacing:-.3px;
}
.rg-sub{color:rgba(255,255,255,.75);font-size:.87rem;}
.rg-steps{
  display:flex;align-items:center;justify-content:center;gap:0;
  margin:0 2rem 1.5rem;padding-top:.5rem;
}
.rg-step{
  display:flex;align-items:center;gap:8px;
}
.rg-step-num{
  width:28px;height:28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:.75rem;font-weight:600;font-family:'Sora',sans-serif;
  transition:.3s;
  border:2px solid #e5e7eb;color:#9ca3af;background:#f9fafb;
}
.rg-step-num.done{background:#4338ca;border-color:#4338ca;color:#fff;}
.rg-step-num.active{background:#4338ca;border-color:#4338ca;color:#fff;box-shadow:0 0 0 3px rgba(67,56,202,.2);}
.rg-step-label{font-size:.75rem;color:#9ca3af;font-weight:500;}
.rg-step-label.active{color:#4338ca;font-weight:600;}
.rg-connector{width:40px;height:2px;background:#e5e7eb;margin:0 4px;flex-shrink:0;}
.rg-connector.done{background:#4338ca;}
.rg-body{padding:0 2rem 2rem;}
.rg-info{
  background:#eff6ff;border-left:3px solid #3b82f6;border-radius:10px;
  padding:.75rem 1rem;margin-bottom:1.4rem;
  display:flex;align-items:center;gap:8px;
  font-size:.82rem;color:#1d4ed8;
}
.rg-err{
  background:#fee2e2;border-left:3px solid #dc2626;border-radius:10px;
  padding:.75rem 1rem;margin-bottom:1.4rem;
  display:flex;align-items:center;gap:8px;
  font-size:.82rem;color:#b91c1c;
}
.rg-grid{display:grid;gap:1rem;}
.rg-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.rg-field{}
.rg-lbl{
  display:block;font-size:.78rem;font-weight:500;color:#374151;
  margin-bottom:6px;
}
.rg-req{color:#ef4444;margin-left:2px;}
.rg-inp,.rg-sel{
  width:100%;padding:.72rem 1rem;
  border:1.5px solid #e5e7eb;border-radius:11px;
  font-size:.9rem;font-family:'DM Sans',sans-serif;color:#1e1b4b;
  background:#f9fafb;outline:none;transition:.2s;
  appearance:none;-webkit-appearance:none;
}
.rg-inp:focus,.rg-sel:focus{
  border-color:#4338ca;background:#fff;
  box-shadow:0 0 0 3px rgba(67,56,202,.1);
}
.rg-sel-wrap{position:relative;}
.rg-sel-wrap::after{
  content:'▾';position:absolute;right:12px;top:50%;transform:translateY(-50%);
  color:#9ca3af;font-size:.75rem;pointer-events:none;
}
.rg-pw-wrap{position:relative;}
.rg-pw-inp{padding-right:3rem;}
.rg-pw-toggle{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:#9ca3af;
  font-size:16px;padding:4px;transition:color .2s;line-height:1;
}
.rg-pw-toggle:hover{color:#4338ca;}
.rg-strength{display:flex;align-items:center;gap:10px;margin-top:8px;}
.rg-bars{display:flex;gap:4px;flex:1;}
.rg-bar{height:4px;flex:1;border-radius:4px;background:#e5e7eb;transition:.3s;}
.rg-str-txt{font-size:.72rem;color:#9ca3af;min-width:50px;text-align:right;}
.rg-actions{display:flex;gap:.75rem;margin-top:1.5rem;}
.rg-btn{
  flex:1;padding:.82rem;border:none;border-radius:12px;
  font-family:'Sora',sans-serif;font-size:.92rem;font-weight:600;
  cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px;
}
.rg-btn-primary{
  background:linear-gradient(135deg,#4338ca,#6d28d9);color:#fff;
  box-shadow:0 4px 14px rgba(67,56,202,.32);
}
.rg-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(67,56,202,.42);}
.rg-btn-primary:disabled{opacity:.65;cursor:not-allowed;}
.rg-btn-ghost{
  background:#f3f4f6;color:#374151;border:1.5px solid #e5e7eb;
  flex:0 0 auto;padding:.82rem 1.25rem;
}
.rg-btn-ghost:hover{background:#e9e9f0;border-color:#c7c7d9;}
.rg-spinner{
  width:16px;height:16px;border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff;border-radius:50%;
  animation:rg-spin .7s linear infinite;
}
@keyframes rg-spin{to{transform:rotate(360deg)}}
.rg-footer{text-align:center;padding-top:1.25rem;border-top:1px solid #f3f4f6;}
.rg-footer p{font-size:.82rem;color:#9ca3af;margin-bottom:4px;}
.rg-link{color:#4338ca;font-weight:600;font-size:.88rem;text-decoration:none;}
.rg-link:hover{color:#6d28d9;}
.rg-process{
  background:#f8f7ff;border-radius:12px;padding:1rem 1.25rem;
  margin-top:1.25rem;font-size:.8rem;color:#374151;
}
.rg-process h5{color:#4338ca;font-weight:600;font-family:'Sora',sans-serif;margin-bottom:.5rem;font-size:.82rem;}
.rg-process ol{padding-left:1.2rem;color:#6b7280;line-height:1.8;}

/* Verification */
.rg-verify{
  width:100%;max-width:460px;background:#fff;border-radius:24px;
  box-shadow:0 32px 72px rgba(0,0,0,.32);overflow:hidden;
  animation:rg-rise .5s cubic-bezier(.4,0,.2,1);
  position:relative;z-index:1;
}
.rg-verify-head{
  background:linear-gradient(135deg,#059669,#10b981);
  padding:2rem 2rem 2.75rem;text-align:center;position:relative;
}
.rg-verify-head::after{
  content:'';position:absolute;bottom:-1px;left:0;right:0;height:44px;
  background:#fff;border-radius:55% 55% 0 0/100% 100% 0 0;
}
.rg-check-ring{
  width:66px;height:66px;border-radius:50%;
  background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.35);
  display:flex;align-items:center;justify-content:center;font-size:28px;
  margin:0 auto 1rem;
}
.rg-verify-body{padding:1.75rem 2rem 2rem;}
.rg-email-badge{
  background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;
  padding:.65rem 1rem;margin:1rem 0;text-align:center;
  font-size:.88rem;font-weight:500;color:#065f46;
  word-break:break-all;
}
.rg-steps-list{
  background:#f8f7ff;border-radius:12px;padding:1rem 1.25rem;
  margin:1rem 0;
}
.rg-steps-list h5{color:#4338ca;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:600;margin-bottom:.6rem;}
.rg-steps-list ol{padding-left:1.2rem;color:#6b7280;font-size:.82rem;line-height:1.8;}
.rg-verify-actions{display:flex;flex-direction:column;gap:.65rem;}
.rg-btn-green{
  background:linear-gradient(135deg,#059669,#10b981);color:#fff;
  box-shadow:0 4px 14px rgba(16,185,129,.3);
}
.rg-btn-green:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(16,185,129,.4);}
.rg-btn-outline{
  background:#fff;color:#4338ca;border:1.5px solid #c7d2fe;
}
.rg-btn-outline:hover{background:#f5f4ff;}
@media(max-width:540px){
  .rg-body{padding:0 1.25rem 1.5rem;}
  .rg-head{padding:1.75rem 1.25rem 2.5rem;}
  .rg-row{grid-template-columns:1fr;}
  .rg-verify-body{padding:1.25rem;}
}
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('rg-styles'); if(el) el.remove(); };
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
      if (!formData.name || !formData.email) { setError('Please fill in all fields.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!formData.course || !formData.branch || !formData.semester) { setError('Please fill in all fields.'); return; }
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
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, password: formData.password,
          course: formData.course, branch: formData.branch, semester: parseInt(formData.semester)
        }),
      });
      const data = await response.json();
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
            <div className="rg-title" style={{color:'#fff',fontFamily:'Sora,sans-serif',fontSize:'1.4rem',fontWeight:700,marginBottom:4}}>Account Created!</div>
            <div style={{color:'rgba(255,255,255,.78)',fontSize:'.87rem'}}>One last step — verify your email</div>
          </div>
          <div className="rg-verify-body">
            <p style={{fontSize:'.85rem',color:'#6b7280',textAlign:'center'}}>We've sent a verification link to:</p>
            <div className="rg-email-badge">{verificationEmail}</div>
            <div className="rg-steps-list">
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
        <div className="rg-steps" style={{padding:'1.25rem 2rem 0'}}>
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const isDone = step > n;
            const isActive = step === n;
            return (
              <React.Fragment key={n}>
                {i > 0 && <div className={`rg-connector${isDone ? ' done' : ''}`} />}
                <div className="rg-step">
                  <div className={`rg-step-num${isDone ? ' done' : isActive ? ' active' : ''}`}>
                    {isDone ? '✓' : n}
                  </div>
                  <span className={`rg-step-label${isActive ? ' active' : ''}`}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="rg-body" style={{marginTop:'1.5rem'}}>
          <div className="rg-info">
            <span>ℹ</span> Verify your email after registration before logging in.
          </div>

          {error && (
            <div className="rg-err">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Step 1 — Personal */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="rg-grid">
                <div className="rg-field">
                  <label className="rg-lbl">Full Name <span className="rg-req">*</span></label>
                  <input className="rg-inp" type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="e.g. Rahul Sharma" required />
                </div>
                <div className="rg-field">
                  <label className="rg-lbl">Email Address <span className="rg-req">*</span></label>
                  <input className="rg-inp" type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="student@example.com" required />
                </div>
              </div>
              <div className="rg-actions">
                <button type="submit" className="rg-btn rg-btn-primary">
                  Continue →
                </button>
              </div>
              <div className="rg-footer" style={{marginTop:'1.25rem'}}>
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
                  <div className="rg-field">
                    <label className="rg-lbl">Course <span className="rg-req">*</span></label>
                    <div className="rg-sel-wrap">
                      <select className="rg-sel" name="course" value={formData.course} onChange={handleChange} required>
                        {courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="rg-field">
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
                <div className="rg-field">
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
                  <div className="rg-field">
                    <label className="rg-lbl">Password <span className="rg-req">*</span></label>
                    <div className="rg-pw-wrap">
                      <input className="rg-inp rg-pw-inp" type={showPassword ? 'text' : 'password'}
                        name="password" value={formData.password} onChange={handleChange}
                        placeholder="Min. 6 characters" required />
                      <button type="button" className="rg-pw-toggle" onClick={() => setShowPassword(v => !v)}>
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div className="rg-field">
                    <label className="rg-lbl">Confirm Password <span className="rg-req">*</span></label>
                    <div className="rg-pw-wrap">
                      <input className="rg-inp rg-pw-inp" type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter password" required />
                      <button type="button" className="rg-pw-toggle" onClick={() => setShowConfirmPassword(v => !v)}>
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
                  <div style={{fontSize:'.78rem',color:'#ef4444',marginTop:'-4px'}}>⚠ Passwords don't match</div>
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

              <div className="rg-footer" style={{marginTop:'1.25rem'}}>
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
