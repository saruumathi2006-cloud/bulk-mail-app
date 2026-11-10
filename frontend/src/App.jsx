import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MailComposer from './components/MailComposer';
import MailHistory from './components/MailHistory';
import Analytics from './components/Analytics';
import AdminLogin from './components/AdminLogin';
import { healthApi, authApi } from './services/api';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'history' | 'analytics' | 'login'
  const [user, setUser] = useState(null);
  const [serverStatus, setServerStatus] = useState({ status: 'checking', mongodb: 'unknown' });

  // Check stored auth session
  useEffect(() => {
    const savedUser = localStorage.getItem('bulk_mail_user');
    const token = localStorage.getItem('bulk_mail_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bulk_mail_user');
      }
    }

    // Health check ping
    const checkServer = async () => {
      try {
        const res = await healthApi.check();
        setServerStatus(res.data);
      } catch {
        setServerStatus({ status: 'offline', mongodb: 'disconnected' });
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bulk_mail_token');
    localStorage.removeItem('bulk_mail_user');
    setUser(null);
  };

  const handleLoginSuccess = (admin) => {
    setUser(admin);
    setActiveTab('send');
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        serverStatus={serverStatus}
      />

      <main className="main-content">
        {activeTab === 'send' && (
          <MailComposer
            user={user}
            onMailSent={() => {
              // optional reaction or notification
            }}
          />
        )}

        {activeTab === 'history' && <MailHistory />}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setActiveTab('send')}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>
            PostPulse Bulk Mail Application • Full Stack MERN (React + Express + Node + MongoDB)
          </p>
        </div>
      </footer>
    </div>
  );
}
