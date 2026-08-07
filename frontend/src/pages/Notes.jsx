import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PurchaseModal from '../components/PurchaseModal';
const API_URL = 'https://study-portal-pi2w.onrender.com/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [purchaseNote, setPurchaseNote] = useState(null); // note currently shown in the purchase modal

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');
      const response = await fetch(`${API_URL}/notes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(note => note.note_type === filter);

  const handleDownload = async (note) => {
    // Premium + not yet purchased -> open the purchase flow instead of
    // hitting the download endpoint (which the backend blocks with 402
    // anyway, but this gives a proper UI instead of a silent failure).
    if (note.locked) {
      setPurchaseNote(note);
      return;
    }

    try {
      const token = localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');
      window.open(`${API_URL}/notes/${note.id}/download`, '_blank');

      if (token) {
        fetch(`${API_URL}/notes/${note.id}/download`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }

      setNotes(prev => prev.map(n =>
        n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      ));
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Study Materials ({notes.length})</h1>
        <Link to="/upload" style={{
          background: '#4f46e5',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          📤 Upload New
        </Link>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            background: filter === 'all' ? '#4f46e5' : '#e5e7eb',
            color: filter === 'all' ? 'white' : '#374151',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          All ({notes.length})
        </button>
        <button 
          onClick={() => setFilter('notes')}
          style={{
            background: filter === 'notes' ? '#10b981' : '#e5e7eb',
            color: filter === 'notes' ? 'white' : '#374151',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          📄 Notes
        </button>
        <button 
          onClick={() => setFilter('pyq')}
          style={{
            background: filter === 'pyq' ? '#f59e0b' : '#e5e7eb',
            color: filter === 'pyq' ? 'white' : '#374151',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          📝 PYQs
        </button>
        <button 
          onClick={() => setFilter('syllabus')}
          style={{
            background: filter === 'syllabus' ? '#3b82f6' : '#e5e7eb',
            color: filter === 'syllabus' ? 'white' : '#374151',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          📋 Syllabus
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading notes from database...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f3f4f6', borderRadius: '10px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3>No {filter === 'all' ? '' : filter} materials found</h3>
          <p>Be the first to upload study materials!</p>
          <Link to="/upload" style={{
            display: 'inline-block',
            background: '#4f46e5',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            marginTop: '1rem'
          }}>
            📤 Upload Now
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem'
        }}>
          {filteredNotes.map(note => (
            <div key={note.id} style={{
              background: 'white',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.3s',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>{note.title}</h3>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {note.is_premium && (
                    <span style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      ⭐ {note.price_display || 'PREMIUM'}
                    </span>
                  )}
                  <span style={{
                    background: note.note_type === 'pyq' ? '#fef3c7' : 
                               note.note_type === 'syllabus' ? '#dbeafe' : '#dcfce7',
                    color: note.note_type === 'pyq' ? '#92400e' : 
                          note.note_type === 'syllabus' ? '#1e40af' : '#166534',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {note.note_type?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p style={{ 
                color: '#6b7280', 
                margin: '1rem 0',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {note.description || 'No description provided'}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: '#6b7280',
                margin: '1rem 0',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div>
                  <span style={{ marginRight: '1rem' }}>📁 {note.file_type?.toUpperCase()}</span>
                  <span>⬇️ {note.downloads || 0}</span>
                </div>
                <div>
                  {note.course_name && <span>📚 {note.course_name}</span>}
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(note)}
                style={{
                  width: '100%',
                  background: note.locked
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
              >
                {note.locked ? `🔒 Unlock — ${note.price_display}` : '⬇️ Download Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {purchaseNote && (
        <PurchaseModal
          note={purchaseNote}
          onClose={() => setPurchaseNote(null)}
          onUnlocked={() => {
            fetchNotes();
          }}
        />
      )}
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          onClick={fetchNotes}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          🔄 Refresh List
        </button>
        <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Total Materials: {notes.length} | Backend: Render
        </p>
      </div>
    </div>
  );
};

export default Notes;