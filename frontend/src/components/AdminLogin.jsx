import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      if (res.data.success) {
        localStorage.setItem('bulk_mail_token', res.data.token);
        localStorage.setItem('bulk_mail_user', JSON.stringify(res.data.admin));
        onLoginSuccess(res.data.admin);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge-icon">
            <ShieldCheck size={28} />
          </div>
          <h2>Admin Authentication</h2>
          <p>Sign in to access admin capabilities and broadcast settings.</p>
        </div>

        {error && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={15} /> Username
            </label>
            <input
              id="username"
              type="text"
              className="input-text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={15} /> Password
            </label>
            <input
              id="password"
              type="password"
              className="input-text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <div className="demo-credentials-box">
            <span>Default Test Credentials:</span>
            <strong>admin</strong> / <strong>admin123</strong>
          </div>

          <div className="form-actions-login">
            {onCancel && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

