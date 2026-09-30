import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage } from '../components/Status.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (isRegister && form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      await authenticate(isRegister ? '/auth/register' : '/auth/login', form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  return <section className="auth-page"><div className="auth-aside"><div className="auth-aside-content"><p className="eyebrow">A PLACE TO COME BACK TO</p><h1>{isRegister ? <>Start with<br /><em>one thing.</em></> : <>Pick up<br /><em>where you left off.</em></>}</h1><p>Make room for the ideas you want to keep. Your cards, your pace, your progress.</p><div className="auth-aside-mark">F.</div></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><p className="eyebrow eyebrow-dark">{isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</p><h2>{isRegister ? 'Join the study space' : 'Log in'}</h2><p className="auth-subtitle">{isRegister ? 'Your next good study session starts here.' : 'Your study space is right where you left it.'}</p>
    {isRegister && <label>Your name<input autoComplete="name" name="name" value={form.name} onChange={update} placeholder="Jamie Morgan" required maxLength="60" /></label>}
    <label>Email address<input autoComplete="email" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label>
    <label>Password<input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" name="password" value={form.password} onChange={update} placeholder="At least 6 characters" minLength="6" required /></label>
    {isRegister && <label>Confirm password<input autoComplete="new-password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} placeholder="Enter your password again" minLength="6" required /></label>}
    {!isRegister && <Link className="forgot-password-link" to="/forgot-password">Forgot password?</Link>}
    <ErrorMessage>{error}</ErrorMessage><button className="button button-coral auth-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : isRegister ? 'Create account' : 'Log in'} <span>↗</span></button>
    <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to flashcards?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
    </form></div></section>;
}
