import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, Users, FileText, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { mailApi } from '../services/api';

export default function MailComposer({ onMailSent, user }) {
  const [subject, setSubject] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [body, setBody] = useState('');
  const [isHtml, setIsHtml] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'warning', message, details, previewUrl }

  // Quick email templates
  const applyTemplate = (type) => {
    if (type === 'newsletter') {
      setSubject('🚀 Monthly Product Updates & New Features');
      setBody(`<h2>Exciting News Inside!</h2>
<p>Hello valued subscriber,</p>
<p>We are thrilled to unveil our brand new improvements. Here's a brief recap of what's updated this month:</p>
<ul>
  <li><strong>Blazing Fast Performance:</strong> Optimized throughput by 40%.</li>
  <li><strong>Enhanced Analytics:</strong> Real-time recipient delivery tracking.</li>
  <li><strong>Modern UI Experience:</strong> Sleek dark/light friendly palette.</li>
</ul>
<p>Have questions? Reply directly to this email or reach out to our support crew.</p>
<br/>
<p>Best regards,<br/><strong>PostPulse Team</strong></p>`);
      setIsHtml(true);
    } else if (type === 'welcome') {
      setSubject('🎉 Welcome to Our Community!');
      setBody(`<h3>Welcome aboard!</h3>
<p>Hi there,</p>
<p>Thank you for getting in touch with us. We are happy to have you with us.</p>
<p>Feel free to explore our platform or check your dashboard at any time.</p>
<p>Warm cheers,<br/>Admin</p>`);
      setIsHtml(true);
    } else if (type === 'announcement') {
      setSubject('⚠️ Scheduled Maintenance Notice');
      setBody(`<h3>Maintenance Notice</h3>
<p>Dear user,</p>
<p>We will be conducting brief scheduled maintenance this weekend. Services might experience intermittent availability for around 15 minutes.</p>
<p>Thank you for your understanding!</p>`);
      setIsHtml(true);
    }
  };

  const getRecipientCount = () => {
    if (!recipientsInput.trim()) return 0;
    const list = recipientsInput
      .split(/[\n,;]+/)
      .map(r => r.trim())
      .filter(Boolean);
    return list.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const count = getRecipientCount();
    if (count === 0) {
      setStatus({
        type: 'error',
        message: 'Please provide at least one recipient email address.',
      });
      return;
    }

    if (!subject.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter an email subject.',
      });
      return;
    }

    if (!body.trim()) {
      setStatus({
        type: 'error',
        message: 'Email body cannot be empty.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await mailApi.sendMail({
        subject,
        recipients: recipientsInput,
        body,
        isHtml,
        sender: user ? user.name : 'Bulk Mail Admin',
      });

      if (res.data.success) {
        setStatus({
          type: res.data.summary.failed > 0 ? 'warning' : 'success',
          message: res.data.message,
          previewUrl: res.data.previewUrl,
          summary: res.data.summary,
        });

        // Trigger parent callback to refresh history if desired
        if (onMailSent) {
          onMailSent(res.data.record);
        }
      } else {
        setStatus({
          type: 'error',
          message: res.data.message || 'Failed to send emails.',
        });
      }
    } catch (err) {
      console.error('Send error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'An error occurred while connecting to the email service.';
      setStatus({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSampleEmails = () => {
    setRecipientsInput('sarah.connor@example.com, alex.murphy@example.com\njohn.doe@company.org; emily.watson@startup.io');
  };

  return (
    <div className="composer-container">
      <div className="composer-header">
        <div className="header-title">
          <h2>Create Bulk Campaign</h2>
          <p>Compose and broadcast emails to multiple recipients in seconds.</p>
        </div>

        <div className="template-bar">
          <span className="template-label">
            <Sparkles size={15} /> Quick Templates:
          </span>
          <button type="button" className="btn-chip" onClick={() => applyTemplate('newsletter')}>
            Newsletter
          </button>
          <button type="button" className="btn-chip" onClick={() => applyTemplate('welcome')}>
            Welcome
          </button>
          <button type="button" className="btn-chip" onClick={() => applyTemplate('announcement')}>
            Notice
          </button>
        </div>
      </div>

      {status && (
        <div className={`alert-banner alert-${status.type}`}>
          <div className="alert-content">
            {status.type === 'success' ? (
              <CheckCircle2 size={20} className="alert-icon" />
            ) : (
              <AlertCircle size={20} className="alert-icon" />
            )}
            <div>
              <p className="alert-msg">{status.message}</p>
              {status.summary && (
                <p className="alert-sub">
                  Sent: <strong>{status.summary.success}</strong> / Failed:{' '}
                  <strong>{status.summary.failed}</strong>
                </p>
              )}
              {status.previewUrl && (
                <div className="ethereal-link-wrapper">
                  <span className="badge-preview">Test Mode (Ethereal)</span>
                  <a
                    href={status.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-btn"
                  >
                    View Sent Email in Live Web Inbox <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
          <button className="alert-dismiss" onClick={() => setStatus(null)}>✕</button>
        </div>
      )}

      <form className="composer-form" onSubmit={handleSubmit}>
        {/* Recipient Section */}
        <div className="form-group">
          <div className="group-header">
            <label htmlFor="recipients">
              <Users size={16} /> Recipient Emails
              <span className="count-pill">{getRecipientCount()} Recipient(s)</span>
            </label>
            <button
              type="button"
              className="btn-text-action"
              onClick={loadSampleEmails}
            >
              Insert Demo Recipients
            </button>
          </div>
          <textarea
            id="recipients"
            className="input-textarea"
            rows={3}
            placeholder="Enter email addresses separated by commas, semicolons, or new lines (e.g. user1@example.com, user2@example.com)"
            value={recipientsInput}
            onChange={(e) => setRecipientsInput(e.target.value)}
            disabled={loading}
          />
          <small className="helper-text">
            Supports multiple entries separated by commas, line breaks, or semicolons. Duplicates will be deduplicated automatically.
          </small>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label htmlFor="subject">
            <FileText size={16} /> Email Subject
          </label>
          <input
            id="subject"
            type="text"
            className="input-text"
            placeholder="e.g. Special Announcement: Welcome to our platform"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Body & Mode Toggle */}
        <div className="form-group">
          <div className="group-header">
            <label htmlFor="body">Message Body</label>
            <div className="mode-toggle">
              <button
                type="button"
                className={`toggle-option ${isHtml ? 'active' : ''}`}
                onClick={() => setIsHtml(true)}
              >
                HTML / Rich
              </button>
              <button
                type="button"
                className={`toggle-option ${!isHtml ? 'active' : ''}`}
                onClick={() => setIsHtml(false)}
              >
                Plain Text
              </button>
            </div>
          </div>
          <textarea
            id="body"
            className="input-textarea body-textarea"
            rows={10}
            placeholder={
              isHtml
                ? "<h2>Hello!</h2><p>Type your message here using HTML tags or standard text.</p>"
                : "Type your plain text message here..."
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Action Controls */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSubject('');
              setRecipientsInput('');
              setBody('');
              setStatus(null);
            }}
            disabled={loading}
          >
            Clear Form
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={18} className="spinner" />
                <span>Sending to {getRecipientCount()} recipient(s)...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Dispatch Bulk Mail</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

