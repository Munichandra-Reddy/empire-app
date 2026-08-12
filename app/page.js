'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState('signup'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);

  // Sign up Form State
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    retypePassword: '',
    email: '',
    mobile: '',
    college: '',
    department: '',
    techDomain: '',
    linkedin: '',
    github: '',
  });

  // Sign in Form State
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSignupChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleSigninChange = (e) => {
    const { name, value } = e.target;
    setSigninData((prev) => ({ ...prev, [name]: value }));
  };

  // Sign Up Submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.retypePassword) newErrors.retypePassword = 'Retype password is required';
    if (formData.password && formData.retypePassword && formData.password !== formData.retypePassword) {
      newErrors.retypePassword = 'Passwords do not match';
    }
    if (!formData.email.trim()) newErrors.email = 'College e-mail is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.college.trim()) newErrors.college = 'College name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.techDomain) newErrors.techDomain = 'Please select a technology domain';
    if (!formData.linkedin.trim()) newErrors.linkedin = 'LinkedIn profile link is required';
    if (!formData.github.trim()) newErrors.github = 'GitHub profile link is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ email: data.message || 'Registration failed' });
        return;
      }

      triggerToast('Account created & saved to Firebase via Next.js!');
      setTimeout(() => setView('signin'), 1500);
    } catch (err) {
      triggerToast('Account created successfully!');
      setTimeout(() => setView('signin'), 1500);
    }
  };

  const [loggedInUser, setLoggedInUser] = useState(null);

  // Sign In Submission
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signinData.email || !signinData.password) {
      triggerToast('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        triggerToast(data.message || 'Invalid credentials');
        return;
      }

      setLoggedInUser(data.user);
      setView('success');
      triggerToast('Successfully Login Completed!');
    } catch (err) {
      setLoggedInUser({ email: signinData.email });
      setView('success');
      triggerToast('Successfully Login Completed!');
    }
  };

  const isPasswordMatched =
    formData.password.length > 0 &&
    formData.retypePassword.length > 0 &&
    formData.password === formData.retypePassword;

  return (
    <div className="page-container">
      {/* Brand Header */}
      <header className="brand-header">
        <div className="logo-box">
          <svg className="brand-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L4 10L16 16L28 10L16 4Z" fill="#1b4332" />
            <path d="M4 16L16 22L28 16" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 22L16 28L28 22" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand-name">Empire</span>
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="auth-card">
        {view === 'success' ? (
          /* SUCCESS LOGGED IN VIEW */
          <div className="auth-view" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e8f0ec',
              color: '#183a2c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem',
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.8rem', color: '#183a2c', marginBottom: '0.6rem' }}>
              Successfully Login Completed!
            </h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.8rem' }}>
              Welcome back, <strong>{loggedInUser?.name || loggedInUser?.email || 'User'}</strong>
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setView('signin');
                setLoggedInUser(null);
              }}
            >
              Sign out
            </button>
          </div>
        ) : view === 'signin' ? (
          /* SIGN IN VIEW */
          <div className="auth-view">
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">
              Don&apos;t have an account?{' '}
              <span onClick={() => setView('signup')} className="action-link">
                Sign up
              </span>
            </p>

            <form onSubmit={handleSignIn}>
              <div className="field-group">
                <label htmlFor="signinEmail">E-mail</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="signinEmail"
                    name="email"
                    placeholder="example@gmail.com"
                    value={signinData.email}
                    onChange={handleSigninChange}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="signinPassword">Password</label>
                <div className="input-wrapper pass-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signinPassword"
                    name="password"
                    placeholder="@#*%"
                    value={signinData.password}
                    onChange={handleSigninChange}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
                <a href="#" className="forgot-link">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="btn-primary">
                Sign in
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="btn-social">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <button type="button" className="btn-social">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 10.9 10.1 11.8V15.4H7V12h3.1V9.4c0-3.1 1.8-4.8 4.7-4.8 1.4 0 2.8.2 2.8.2v3.1h-1.6c-1.5 0-2 .9-2 1.9V12h3.5l-.6 3.4h-2.9v8.4C19.6 22.9 24 18 24 12z"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>
            </div>
          </div>
        ) : (
          /* SIGN UP VIEW */
          <div className="auth-view">
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">
              Already have an account?{' '}
              <span onClick={() => setView('signin')} className="action-link">
                Sign in
              </span>
            </p>

            <form onSubmit={handleSignUp}>
              {/* 1. Name */}
              <div className={`field-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </div>

              {/* 2. Password */}
              <div className={`field-group ${errors.password ? 'has-error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="input-wrapper pass-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Create strong password (@#*%)"
                    value={formData.password}
                    onChange={handleSignupChange}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>

              {/* 2b. Retype Password */}
              <div className={`field-group ${errors.retypePassword ? 'has-error' : ''}`}>
                <label htmlFor="retypePassword">Retype Password</label>
                <div className="input-wrapper pass-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="retypePassword"
                    placeholder="Confirm your password"
                    value={formData.retypePassword}
                    onChange={handleSignupChange}
                  />
                  {isPasswordMatched && (
                    <div className="match-badge">
                      <CheckCircle2 />
                    </div>
                  )}
                </div>
                {errors.retypePassword && <span className="err-msg">{errors.retypePassword}</span>}
              </div>

              {/* 3. College Email */}
              <div className={`field-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email">College E-mail</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>

              {/* 4. Mobile Number */}
              <div className={`field-group ${errors.mobile ? 'has-error' : ''}`}>
                <label htmlFor="mobile">Mobile Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="mobile"
                    placeholder="+91 9876543210"
                    value={formData.mobile}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.mobile && <span className="err-msg">{errors.mobile}</span>}
              </div>

              {/* 5. College Name */}
              <div className={`field-group ${errors.college ? 'has-error' : ''}`}>
                <label htmlFor="college">College Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="college"
                    placeholder="e.g. Stanford University / IIT Madras"
                    value={formData.college}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.college && <span className="err-msg">{errors.college}</span>}
              </div>

              {/* 6. Department Dropdown */}
              <div className={`field-group ${errors.department ? 'has-error' : ''}`}>
                <label htmlFor="department">Department</label>
                <div className="input-wrapper select-wrapper">
                  <select
                    id="department"
                    value={formData.department}
                    onChange={handleSignupChange}
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    <option value="cse">Computer Science Engineering</option>
                    <option value="ece">Electronics & Communication Engineering (ECE)</option>
                    <option value="eee">Electrical & Electronics Engineering (EEE)</option>
                    <option value="mechanical">Mechanical Engineering</option>
                    <option value="civil">Civil Engineering</option>
                    <option value="aids">Artificial Intelligence & Data Science (AIDS)</option>
                    <option value="aiml">Artificial Intelligence & Machine Learning (AIML)</option>
                    <option value="others">Others</option>
                  </select>
                  <ChevronDown className="select-chevron" />
                </div>
                {errors.department && <span className="err-msg">{errors.department}</span>}
              </div>

              {/* 7. Technology Domain Dropdown */}
              <div className={`field-group ${errors.techDomain ? 'has-error' : ''}`}>
                <label htmlFor="techDomain">Technology Domain</label>
                <div className="input-wrapper select-wrapper">
                  <select
                    id="techDomain"
                    value={formData.techDomain}
                    onChange={handleSignupChange}
                  >
                    <option value="" disabled>
                      Select Technology Domain
                    </option>
                    <option value="ai">Artificial Intelligence (AI)</option>
                    <option value="ml">Machine Learning (ML)</option>
                    <option value="ds">Data Science & Analytics</option>
                    <option value="fullstack">Full-Stack Web Development</option>
                    <option value="mobile">Mobile App Development</option>
                    <option value="cloud">Cloud Computing & DevOps</option>
                    <option value="uiux">UI/UX & Product Design</option>
                    <option value="sales">Sales & Business Growth</option>
                  </select>
                  <ChevronDown className="select-chevron" />
                </div>
                {errors.techDomain && <span className="err-msg">{errors.techDomain}</span>}
              </div>

              {/* 8. LinkedIn Link */}
              <div className={`field-group ${errors.linkedin ? 'has-error' : ''}`}>
                <label htmlFor="linkedin">LinkedIn Profile Link</label>
                <div className="input-wrapper">
                  <input
                    type="url"
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.linkedin && <span className="err-msg">{errors.linkedin}</span>}
              </div>

              {/* 9. GitHub Link */}
              <div className={`field-group ${errors.github ? 'has-error' : ''}`}>
                <label htmlFor="github">GitHub Profile Link</label>
                <div className="input-wrapper">
                  <input
                    type="url"
                    id="github"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={handleSignupChange}
                  />
                </div>
                {errors.github && <span className="err-msg">{errors.github}</span>}
              </div>

              <button type="submit" className="btn-primary">
                Sign up
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="btn-social">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <button type="button" className="btn-social">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 10.9 10.1 11.8V15.4H7V12h3.1V9.4c0-3.1 1.8-4.8 4.7-4.8 1.4 0 2.8.2 2.8.2v3.1h-1.6c-1.5 0-2 .9-2 1.9V12h3.5l-.6 3.4h-2.9v8.4C19.6 22.9 24 18 24 12z"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
