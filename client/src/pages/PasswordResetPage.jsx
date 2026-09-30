import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { request, send } from '../services/api.js';
import { ErrorMessage } from '../components/Status.jsx';

export default function PasswordResetPage({ mode }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isReset = mode === 'reset';
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    if (isReset && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      if (isReset) {
        const result = await request('/auth/reset-password', send('POST', { token, ...form }));
        setMessage(result.message);
      } else {
        const result = await request('/auth/forgot-password', send('POST', { email }));
        setMessage(result.message);
        setResetUrl(result.resetUrl || '');
      }
    } catch (issue) {
      setError(issue.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-page">
    <div className="auth-aside"><div className="auth-aside-content"><p className="eyebrow">A PLACE TO COME BACK TO</p><h1>{isReset ? <>A fresh<br /><em>start.</em></> : <>Let’s get you<br /><em>back in.</em></>}</h1><p>Your cards, your pace, your progress. Pick up right where you left off.</p><div className="auth-aside-mark">F.</div></div></div>
    <div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}>
      <p className="eyebrow eyebrow-dark">{isReset ? 'PASSWORD RESET' : 'ACCOUNT RECOVERY'}</p>
      <h2>{isReset ? 'Choose a new password' : 'Forgot password?'}</h2>
      <p className="auth-subtitle">{isReset ? 'Choose a new password to get back to your study space.' : 'Enter the email address on your account and we’ll send reset instructions.'}</p>
      {!isReset && <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>}
      {isReset && <>
        {!token && <p className="form-error">This reset link is missing its token. Request a new link below.</p>}
        <label>New password<input autoComplete="new-password" type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" required disabled={!token} /></label>
        <label>Confirm new password<input autoComplete="new-password" type="password" minLength="6" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Enter your password again" required disabled={!token} /></label>
      </>}
      {message && <p className="form-success" role="status">{message}</p>}
      {resetUrl && <a className="reset-dev-link" href={resetUrl}>Continue to reset password ↗</a>}
      <ErrorMessage>{error}</ErrorMessage>
      <button className="button button-coral auth-submit" type="submit" disabled={busy || (isReset && !token)}>{busy ? 'One moment…' : isReset ? 'Reset password' : 'Send reset link'} <span>↗</span></button>
      <p className="auth-switch"><Link to={isReset ? '/forgot-password' : '/login'}>{isReset && !token ? 'Request a new reset link' : '← Back to login'}</Link></p>
    </form></div>
  </section>;
}