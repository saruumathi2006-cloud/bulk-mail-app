import React from 'react';
import { Mail, History, BarChart3, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, serverStatus }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setActiveTab('send')}>
          <div className="brand-icon">
            <Mail size={22} color="#fff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">PostPulse</span>
            <span className="brand-badge">Bulk Mailer</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-btn ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <Mail size={17} />
            <span>Composer</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={17} />
            <span>Mail History</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={17} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="navbar-actions">
          <div className="server-pill" title={`MongoDB: ${serverStatus?.mongodb || 'checking'}`}>
            <span className={`status-dot ${serverStatus?.status === 'online' ? 'online' : 'offline'}`} />
            <span className="status-label">
              {serverStatus?.status === 'online' ? 'API Online' : 'Connecting...'}
            </span>
          </div>

          {user ? (
            <div className="user-profile">
              <span className="user-name">👤 {user.name || user.username}</span>
              <button className="btn-logout" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn-login-modal" onClick={() => setActiveTab('login')}>
              <LogIn size={16} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

