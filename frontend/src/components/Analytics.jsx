import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertTriangle, Users, Layers, TrendingUp } from 'lucide-react';
import { mailApi } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalFailed: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await mailApi.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const deliveryRate =
    stats.totalRecipients > 0
      ? Math.round((stats.totalSent / stats.totalRecipients) * 100)
      : 100;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Performance & Delivery Metrics</h2>
        <p>Real-time analytics aggregating sent bulk email campaigns.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-blue">
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Campaigns</span>
            <span className="stat-value">{stats.totalCampaigns}</span>
            <span className="stat-sub">Broadcast batches run</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-purple">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Recipients</span>
            <span className="stat-value">{stats.totalRecipients}</span>
            <span className="stat-sub">Across all batches</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Emails Delivered</span>
            <span className="stat-value">{stats.totalSent}</span>
            <span className="stat-sub">Successfully dispatched</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-amber">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">{deliveryRate}%</span>
            <span className="stat-sub">{stats.totalFailed} delivery failures</span>
          </div>
        </div>
      </div>

      <div className="insights-panel">
        <h3>Architecture & SMTP Diagnostic Status</h3>
        <div className="info-list">
          <div className="info-card">
            <h4>📬 Nodemailer Transport Mode</h4>
            <p>
              Operating with an integrated transporter. Supports standard SMTP (Gmail, Outlook, SendGrid, Amazon SES) or instant zero-config Ethereal sandbox with live web viewer links.
            </p>
          </div>
          <div className="info-card">
            <h4>💾 MongoDB Document Storage</h4>
            <p>
              Stores every single campaign with individual recipient delivery receipts, timestamps, subject line, formatted HTML/plain body, and status logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

