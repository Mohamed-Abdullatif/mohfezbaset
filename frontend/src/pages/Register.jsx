import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';

export default function Register() {
  const { t, login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.status === 409 ? t.errorEmailExists : t.error);
    } finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const res = await axios.post('/api/auth/google', { access_token: tokenResponse.access_token });
        login(res.data.user, res.data.token);
        navigate('/');
      } catch {
        setError(t.error);
      } finally { setLoading(false); }
    },
    onError: () => setError(t.error),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img className="auth-logo-img" src={`${import.meta.env.BASE_URL}logo-full.webp`} alt="المحفظ البسيط للقرآن الكريم" width="180" height="176" />
          <h2>{t.appName}</h2>
          <p>{t.register}</p>
        </div>

        <button className="btn-google" onClick={() => googleLogin()} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {t.loginWithGoogle}
        </button>

        <div className="auth-divider"><span>{t.orContinueWith}</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.name}</label>
            <input className="form-input" type="text" required
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">{t.email}</label>
            <input className="form-input" type="email" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">{t.password}</label>
            <input className="form-input" type="password" required minLength={6}
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          {error && <div style={{ color: '#FF8080', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t.loading : t.register}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text2)' }}>
          {t.hasAccount} <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>{t.login}</Link>
        </p>
      </div>
    </div>
  );
}
