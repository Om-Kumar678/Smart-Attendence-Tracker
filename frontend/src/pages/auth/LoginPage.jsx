import { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, ShieldCheck, Sparkles, UserRoundCheck } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { getErrorMessage } from '../../services/api.js';

const landingPath = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };

export default function LoginPage() {
  const { user, signIn, mockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState(() => localStorage.getItem('attendly-remembered-identifier') || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={landingPath[user.role] || '/unauthorized'} replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!identifier.trim()) return setError('Enter your email or username.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      if (remember) localStorage.setItem('attendly-remembered-identifier', identifier.trim());
      else localStorage.removeItem('attendly-remembered-identifier');
      const signedInUser = await signIn({ identifier, password, role });
      toast.success(`Welcome back, ${signedInUser.name.split(' ')[0]}!`);
      navigate(location.state?.from?.pathname || landingPath[signedInUser.role] || '/unauthorized', { replace: true });
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Unable to sign in.');
      setError(message);
    } finally { setLoading(false); }
  }

  return <div className="login-page">
    <section className="login-panel"><div className="login-brand"><span className="brand-mark"><UserRoundCheck size={20} /></span><span>attendly<span className="brand-dot">.</span></span></div>
      <div className="login-form-wrap"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to your<br />workspace</h1><p className="login-subtitle">A better way to stay connected to every class.</p>
        <form className="login-form" onSubmit={submit} noValidate>
          <label className="field-label">Email or username<input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@northstar.edu" /></label>
          <label className="field-label">Password<div className="password-wrap"><input autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {mockMode && <label className="field-label">Demo role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="admin">Administrator</option><option value="teacher">Teacher</option><option value="student">Student</option></select></label>}
          <div className="login-options"><label className="checkbox-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="checkmark"><Check size={12} /></span>Remember me</label><button type="button" className="text-link" onClick={() => toast.info('Please contact your college administrator to reset your password.')}>Forgot password?</button></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary login-submit" disabled={loading}>{loading ? <><span className="button-spinner" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}</button>
        </form>
        {mockMode && <div className="demo-login-note"><Sparkles size={15} /> Demo mode: use any email and a password of 6+ characters.</div>}
        <p className="login-legal">By continuing, you agree to your institution’s acceptable use policy.</p>
      </div><div className="login-footer">© 2026 Attendly · Built for better learning</div>
    </section>
    <section className="login-visual"><div className="visual-orb orb-one" /><div className="visual-orb orb-two" /><div className="visual-content"><div className="visual-top"><span className="live-pill"><i /> CAMPUS AT A GLANCE</span><span className="visual-term">FALL · 2026</span></div><div className="visual-copy"><p>Every class counts.</p><h2>Make every<br /><em>moment</em> matter.</h2><span>Simple attendance, meaningful insights, and more time for what matters most.</span></div>
      <div className="preview-card"><div className="preview-head"><div><small>THIS WEEK</small><strong>Attendance overview</strong></div><div className="preview-icon"><ShieldCheck size={17} /></div></div><div className="preview-number">92.4% <span>↑ 3.2%</span></div><div className="mini-bars">{[42, 62, 54, 86, 70, 94, 77, 100, 66, 82, 93, 72, 88, 61, 98, 77, 88, 67, 100, 81, 73, 92, 62, 83, 96, 73, 87, 65].map((height, index) => <i key={index} style={{ height: `${height}%`, opacity: 0.42 + height / 180 }} />)}</div><div className="preview-legend"><span><i /> Present</span><span>Last 4 weeks</span></div></div>
      <div className="floating-note"><span className="floating-check"><Check size={16} /></span><span><strong>Class recorded</strong><small>Data Structures · 9:00 AM</small></span></div>
      <div className="visual-foot"><span>Made for campus life</span><span>01 — 03</span></div>
    </div></section>
  </div>;
}
