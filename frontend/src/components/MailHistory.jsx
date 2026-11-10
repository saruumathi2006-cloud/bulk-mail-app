import React, { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle2, AlertTriangle, XCircle, Trash2, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { mailApi } from '../services/api';

export default function MailHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setError(null);
      const res = await mailApi.getHistory();
      if (res.data.success) {
        setHistory(res.data.records);
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError('Failed to load email history. Make sure the backend server is reachable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this mail history entry?')) return;

    try {
      await mailApi.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item._id !== id));
      if (selectedMail?._id === id) {
        setSelectedMail(null);
      }
    } catch (err) {
      alert('Failed to delete history item');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge badge-success"><CheckCircle2 size={13} /> Completed</span>;
      case 'partially_failed':
        return <span className="status-badge badge-warning"><AlertTriangle size={13} /> Partial</span>;
      case 'failed':
        return <span className="status-badge badge-danger"><XCircle size={13} /> Failed</span>;
      default:
        return <span className="status-badge badge-pending">Pending</span>;
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2>Campaign History & Logs</h2>
          <p>Review past broadcast dispatches, recipient delivery statuses, and previews.</p>
        </div>
        <button
          className="btn-outline"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={32} className="spinner" />
          <p>Loading email records from MongoDB...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <Mail size={48} className="empty-icon" />
          <h3>No Sent Emails Yet</h3>
          <p>When you send your first bulk email campaign, records and logs will appear here.</p>
        </div>
      ) : (
        <div className="history-grid">
          {/* Table List */}
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item._id}
                    className={selectedMail?._id === item._id ? 'selected-row' : ''}
                    onClick={() => setSelectedMail(item)}
                  >
                    <td className="subject-col">
                      <span className="subject-title">{item.subject}</span>
                      <span className="sender-sub">By {item.sender || 'Admin'}</span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <span className="count-pill-sm">
                        {item.successCount} / {item.totalCount} sent
                      </span>
                    </td>
                    <td className="date-col">
                      <Calendar size={13} style={{ marginRight: 4 }} />
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-icon-btn"
                          title="View Details"
                          onClick={() => setSelectedMail(item)}
                        >
                          <Eye size={16} />
                        </button>
                        {item.previewUrl && (
                          <a
                            href={item.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-icon-btn"
                            title="Open Ethereal Preview"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          className="action-icon-btn delete-btn"
                          title="Delete Record"
                          onClick={(e) => handleDelete(item._id, e)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Details Modal / Drawer Side Panel */}
          {selectedMail && (
            <div className="details-panel">
              <div className="details-header">
                <h3>Campaign Details</h3>
                <button
                  className="close-btn"
                  onClick={() => setSelectedMail(null)}
                >
                  ✕
                </button>
              </div>

              <div className="details-body">
                <div className="detail-item">
                  <span className="detail-label">Subject</span>
                  <div className="detail-value bold">{selectedMail.subject}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <div>{getStatusBadge(selectedMail.status)}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Sent Date</span>
                  <div className="detail-value">{formatDate(selectedMail.createdAt)}</div>
                </div>

                {selectedMail.previewUrl && (
                  <div className="detail-item">
                    <span className="detail-label">Live Test Preview</span>
                    <a
                      href={selectedMail.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-highlight"
                    >
                      Open Email in Ethereal Web Viewer <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                <div className="detail-item">
                  <span className="detail-label">Recipient Deliveries ({selectedMail.recipientDetails?.length || selectedMail.recipients?.length || 0})</span>
                  <div className="recipients-list">
                    {selectedMail.recipientDetails && selectedMail.recipientDetails.length > 0 ? (
                      selectedMail.recipientDetails.map((rec, idx) => (
                        <div key={idx} className="recipient-row">
                          <span className="rec-email">{rec.email}</span>
                          <span className={`rec-status ${rec.status}`}>
                            {rec.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      selectedMail.recipients?.map((rec, idx) => (
                        <div key={idx} className="recipient-row">
                          <span className="rec-email">{rec}</span>
                          <span className="rec-status sent">sent</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Body Content</span>
                  <div
                    className="email-preview-box"
                    dangerouslySetInnerHTML={{
                      __html: selectedMail.isHtml ? selectedMail.body : `<pre>${selectedMail.body}</pre>`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

