import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAdmin, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [pendingNotes, setPendingNotes] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [approvedPayments, setApprovedPayments] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_courses: 0,
    total_notes: 0,
    approved_notes: 0,
    pending_notes: 0,
    total_downloads: 0
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchPendingNotes();
      fetchStats();
      fetchPendingPayments();
      fetchApprovedPayments();
    }
  }, []);

  const fetchApprovedPayments = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/payments/all?status=approved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const purchases = data.purchases || [];
      setApprovedPayments(purchases);
      return purchases;
    } catch (error) {
      console.error('Error fetching approved payments:', error);
      return [];
    } finally {
      setApprovedLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/payments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const purchases = data.purchases || [];
      setPendingPayments(purchases);
      return purchases;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleApprovePayment = async (purchaseId) => {
    if (!window.confirm('Confirm you have verified this UTR in your bank/UPI app before approving?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/payments/${purchaseId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // A 502/504 here usually means Render's free-tier server was cold-
      // starting or the connection dropped mid-response — the request may
      // well have reached Flask and committed anyway. Rather than alert a
      // scary "Failed" and risk the admin retrying into a false alarm,
      // fetch a fresh copy of the list and check whether it's actually gone.
      if (response.status >= 500) {
        const freshList = await fetchPendingPayments();
        const stillPending = (freshList || []).some(p => p.id === purchaseId);
        alert(stillPending
          ? 'Server took too long to respond — please check the list and try again if it\'s still showing as pending.'
          : 'Payment approved — note unlocked for the student');
        if (!stillPending) fetchApprovedPayments();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert('Payment approved — note unlocked for the student');
        fetchPendingPayments();
        fetchApprovedPayments();
      } else if (response.status === 400 && /already/i.test(data.error || '')) {
        // Someone (possibly this same click, retried by the browser) already
        // approved/rejected it — not a real failure, just stale UI.
        fetchPendingPayments();
        fetchApprovedPayments();
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      // Network-level failure (e.g. request never completed) — refresh to
      // find out the real state rather than assuming it failed.
      const freshList = await fetchPendingPayments();
      const stillPending = (freshList || []).some(p => p.id === purchaseId);
      alert(stillPending
        ? 'Connection issue — the approval may not have gone through. Please try again.'
        : 'Payment approved — note unlocked for the student');
      if (!stillPending) fetchApprovedPayments();
    }
  };

  const handleRejectPayment = async (purchaseId) => {
    const reason = prompt('Enter rejection reason (required, shown to the student):');
    if (!reason || reason.trim() === '') {
      alert('Reason is required');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/payments/${purchaseId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });

      if (response.ok) {
        alert('Payment rejected');
        fetchPendingPayments();
      } else {
        const data = await response.json();
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reject payment');
    }
  };

  const fetchPendingNotes = async () => {
    try {
      const token = getToken();
      const response = await fetch('https://study-portal-pi2w.onrender.com/api/admin/pending-notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPendingNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching pending notes:', error);
      alert('Failed to load pending notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch('https://study-portal-pi2w.onrender.com/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (noteId) => {
    if (!window.confirm('Are you sure you want to approve this note?')) return;
    
    try {
      const token = getToken();
      const response = await fetch(`https://study-portal-pi2w.onrender.com/api/admin/notes/${noteId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(` Note approved!\nGoogle Drive URL: ${data.drive_url || 'Uploaded to Drive'}`);
        fetchPendingNotes();
        fetchStats(); // Refresh stats
      } else {
        alert(` Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to approve note');
    }
  };

  const handleReject = async (noteId) => {
    const reason = prompt('Enter rejection reason (required):');
    if (!reason || reason.trim() === '') {
      alert('Reason is required');
      return;
    }
    
    try {
      const token = getToken();
      const response = await fetch(`https://study-portal-pi2w.onrender.com/api/admin/notes/${noteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      
      if (response.ok) {
        alert(' Note rejected!');
        fetchPendingNotes();
        fetchStats();
      } else {
        const data = await response.json();
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reject note');
    }
  };

  // Admin access check
  if (!isAdmin()) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>🚫 Admin Access Required</h2>
        <p>You don't have permission to access this page.</p>
        <p>Please log in with an admin account.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h1>👑 Admin Dashboard</h1>
        <p style={{ opacity: 0.9 }}>Welcome, {user?.name} ({user?.email})</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <StatCard title="Total Users" value={stats.total_users} icon="👥" />
        <StatCard title="Total Courses" value={stats.total_courses} icon="📚" />
        <StatCard title="Total Notes" value={stats.total_notes} icon="📝" />
        <StatCard title="Approved Notes" value={stats.approved_notes} icon="" color="green" />
        <StatCard title="Pending Notes" value={stats.pending_notes} icon="⏳" color="orange" />
        <StatCard title="Downloads" value={stats.total_downloads} icon="⬇️" />
      </div>

      {/* Tabs */}
      <div className="ap-tabs">
        <button
          onClick={() => setActiveTab('notes')}
          className={`ap-tab ${activeTab === 'notes' ? 'is-active' : ''}`}
        >
          ⏳ Pending Notes
          <span className={`ap-tab-count ${pendingNotes.length > 0 ? 'has-items' : ''}`}>{pendingNotes.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`ap-tab ${activeTab === 'payments' ? 'is-active' : ''}`}
        >
          💳 Payments to Review
          <span className={`ap-tab-count ${pendingPayments.length > 0 ? 'has-items' : ''}`}>{pendingPayments.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`ap-tab ${activeTab === 'approved' ? 'is-active' : ''}`}
        >
          ✅ Approved
          <span className="ap-tab-count">{approvedPayments.length}</span>
        </button>
      </div>

      {/* Pending Notes Section */}
      {activeTab === 'notes' && (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
          ⏳ Pending Approvals ({pendingNotes.length})
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Loading pending notes...</p>
          </div>
        ) : pendingNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎉 All caught up!</p>
            <p>No pending notes to review.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {pendingNotes.map(note => (
              <div key={note.id} style={{
                background: '#fff9db',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '2px solid #fbbf24',
                position: 'relative'
              }}>
                {/* Note Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{note.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      <span><strong>📁 Type:</strong> {note.note_type}</span>
                      <span><strong>📅 Uploaded:</strong> {new Date(note.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span style={{
                    background: '#fbbf24',
                    color: '#78350f',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    PENDING
                  </span>
                </div>

                {/* Note Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      <strong>👤 Uploaded by:</strong> {note.user_name || note.uploader_name}
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                      {note.user_email || note.uploader_email}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      <strong>📚 Course:</strong> {note.course_name}
                    </p>
                    <p style={{ margin: '0', color: '#666' }}>
                      {note.course_branch || note.user_branch}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {note.description && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{note.description}</p>
                  </div>
                )}

                {/* File Info */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0' }}>
                      <strong>📎 File:</strong> {note.file_name}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                      {note.file_type ? `Type: ${note.file_type.toUpperCase()}` : ''}
                    </p>
                  </div>
                  <a 
                    href={`https://study-portal-pi2w.onrender.com/api/files/${note.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    👁️ Preview File
                  </a>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => handleReject(note.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                     Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(note.id)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                     Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Payments to Review Section */}
      {activeTab === 'payments' && (
      <div className="ap-panel">
        <h2 className="ap-panel-title">UPI payments awaiting review</h2>
        <p className="ap-panel-subtitle">
          Razorpay payments unlock automatically and never show up here. Only manual UPI orders need your review —
          check the UTR against your bank or UPI app before approving.
        </p>

        {paymentsLoading ? (
          <div className="ap-loading-state">
            <span className="ap-spinner"></span>
            <p>Loading pending payments…</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="ap-empty-state">
            <div className="ap-empty-icon">✓</div>
            <h3>All caught up</h3>
            <p>No payments waiting on review right now.</p>
          </div>
        ) : (
          <div className="ap-payment-list">
            {pendingPayments.map(purchase => (
              <div key={purchase.id} className="ap-payment-card">
                {/* Header */}
                <div className="ap-payment-head">
                  <div>
                    <h3 className="ap-payment-title">{purchase.note_title}</h3>
                    <div className="ap-payment-meta">
                      <span><strong>{purchase.amount_display}</strong></span>
                      <span>{new Date(purchase.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="ap-status-pill">Pending</span>
                </div>

                {/* Student + UTR */}
                <div className="ap-payment-body">
                  <div className="ap-student">
                    <div className="ap-avatar">
                      {(purchase.user_name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="ap-student-info">
                      <div className="ap-student-name">{purchase.user_name}</div>
                      <div className="ap-student-email">{purchase.user_email}</div>
                    </div>
                  </div>
                  <div className="ap-utr-block">
                    <span className="ap-utr-label">UTR / Reference</span>
                    <span className="ap-utr-value">{purchase.utr_reference || '—'}</span>
                  </div>
                </div>

                {/* Proof screenshot */}
                <div className="ap-proof-row">
                  <span>{purchase.proof_url ? '📎 Screenshot uploaded by student' : 'No screenshot uploaded'}</span>
                  {purchase.proof_url && (
                    <a
                      href={purchase.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ap-proof-link"
                    >
                      👁️ View
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ap-actions">
                  <button
                    onClick={() => handleRejectPayment(purchase.id)}
                    className="ap-btn ap-btn-reject"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprovePayment(purchase.id)}
                    className="ap-btn ap-btn-approve"
                  >
                    Approve — unlock note
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Approved Payments Section */}
      {activeTab === 'approved' && (
      <div className="ap-panel">
        <h2 className="ap-panel-title">Approved payments</h2>
        <p className="ap-panel-subtitle">
          Every purchase that's unlocked a note so far — both auto-verified Razorpay payments and manually reviewed UPI ones.
        </p>

        {approvedLoading ? (
          <div className="ap-loading-state">
            <span className="ap-spinner"></span>
            <p>Loading approved payments…</p>
          </div>
        ) : approvedPayments.length === 0 ? (
          <div className="ap-empty-state">
            <div className="ap-empty-icon">₹</div>
            <h3>No approved payments yet</h3>
            <p>Once payments are approved, they'll show up here.</p>
          </div>
        ) : (
          <>
            <div className="ap-summary-row">
              <div className="ap-summary-card">
                <span className="ap-summary-label">Total approved</span>
                <span className="ap-summary-value">{approvedPayments.length}</span>
              </div>
              <div className="ap-summary-card ap-summary-card--accent">
                <span className="ap-summary-label">Total revenue</span>
                <span className="ap-summary-value">
                  ₹{(approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100).toFixed(0)}
                </span>
              </div>
            </div>

            <div className="ap-approved-table">
              <div className="ap-approved-head-row">
                <span>Student</span>
                <span>Note</span>
                <span>Amount</span>
                <span>Method</span>
                <span>Approved on</span>
              </div>
              {approvedPayments.map(purchase => (
                <div key={purchase.id} className="ap-approved-row">
                  <div className="ap-approved-cell ap-approved-student">
                    <div className="ap-avatar ap-avatar-sm">
                      {(purchase.user_name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="ap-student-name">{purchase.user_name}</div>
                      <div className="ap-student-email">{purchase.user_email}</div>
                    </div>
                  </div>
                  <div className="ap-approved-cell ap-approved-note">{purchase.note_title}</div>
                  <div className="ap-approved-cell ap-approved-amount">{purchase.amount_display}</div>
                  <div className="ap-approved-cell">
                    <span className={`ap-method-pill ${purchase.method === 'razorpay' ? 'ap-method-razorpay' : 'ap-method-upi'}`}>
                      {purchase.method === 'razorpay' ? 'Razorpay' : 'UPI (manual)'}
                    </span>
                  </div>
                  <div className="ap-approved-cell ap-approved-date">
                    {purchase.reviewed_at ? new Date(purchase.reviewed_at).toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color = '#667eea' }) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ 
        background: `${color}20`,
        color: color,
        width: '50px',
        height: '50px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{title}</p>
        <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
          {value !== undefined ? value : '0'}
        </p>
      </div>
    </div>
  </div>
);

export default AdminPanel;
