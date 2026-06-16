import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <Card className="auth-card">
        <div className="section-head">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>Sign in to book bikes or switch to admin tools.</p>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          {mode === 'register' && (
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          )}
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>

        <button className="btn btn-ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
        </button>
      </Card>
    </div>
  );
}