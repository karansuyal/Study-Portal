import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ✅ FIXED: Use Render backend URL
const API_URL = 'https://study-portal-ill8.onrender.com/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`);
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

  const handleDownload = async (noteId, filename) => {
    try {
      // ✅ FIXED: Use Render URL for download
      window.open(`${API_URL}/notes/${noteId}/download`, '_blank');
      
      // Update download count in UI
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, downloads: (note.downloads || 0) + 1 }
          : note
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
                onClick={() => handleDownload(note.id, note.file_name)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
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
                  transition: 'all 0.3s',
                  ':hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                ⬇️ Download Now
              </button>
            </div>
          ))}
        </div>
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