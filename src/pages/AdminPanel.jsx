import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user, isAdmin, getToken } = useAuth();
  const [pendingNotes, setPendingNotes] = useState([]);
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
    }
  }, []);

  const fetchPendingNotes = async () => {
    try {
      const token = getToken();
      const response = await fetch('https://study-portal-ill8.onrender.com/api/admin/pending-notes', {
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
      const response = await fetch('https://study-portal-ill8.onrender.com/api/admin/stats', {
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
      const response = await fetch(`https://study-portal-ill8.onrender.com/api/admin/notes/${noteId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Note approved!\nGoogle Drive URL: ${data.drive_url || 'Uploaded to Drive'}`);
        fetchPendingNotes();
        fetchStats(); // Refresh stats
      } else {
        alert(`❌ Failed: ${data.error || 'Unknown error'}`);
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
      const response = await fetch(`https://study-portal-ill8.onrender.com/api/admin/notes/${noteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      
      if (response.ok) {
        alert('❌ Note rejected!');
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
        <StatCard title="Approved Notes" value={stats.approved_notes} icon="✅" color="green" />
        <StatCard title="Pending Notes" value={stats.pending_notes} icon="⏳" color="orange" />
        <StatCard title="Downloads" value={stats.total_downloads} icon="⬇️" />
      </div>

      {/* Pending Notes Section */}
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
                    href={`https://study-portal-ill8.onrender.com/api/files/${note.file_name}`}
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
                    ❌ Reject
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
                    ✅ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
