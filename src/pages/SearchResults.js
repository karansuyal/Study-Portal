// SearchResults.js - Real notes/PYQ/syllabus search (Postgres full-text search on the backend)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaFilePdf, FaFileWord, FaYoutube, FaFileAlt, FaDownload, FaEye, FaStar } from 'react-icons/fa';
import { searchNotes } from '../services/api';

const typeIcon = (note) => {
  if (note.is_youtube) return <FaYoutube />;
  if (note.file_type === 'pdf') return <FaFilePdf />;
  if (note.file_type === 'doc' || note.file_type === 'docx') return <FaFileWord />;
  return <FaFileAlt />;
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fuzzy, setFuzzy] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!query) {
      setNotes([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchNotes(query).then((result) => {
      if (cancelled) return;
      setNotes(result.notes);
      setFuzzy(result.fuzzy);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [query]);

  const isMobile = windowWidth <= 768;

  const openNote = (note) => {
    if (note.is_youtube && note.youtube_url) {
      window.open(note.youtube_url, '_blank');
      return;
    }
    if (note.cloudinary_url) {
      const isPDF = note.cloudinary_url.includes('.pdf') || note.file_type === 'pdf';
      if (isPDF) {
        window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(note.cloudinary_url)}&embedded=true`, '_blank');
      } else {
        window.open(note.cloudinary_url, '_blank');
      }
    }
  };

  const styles = {
    container: {
      padding: isMobile ? '1rem' : '2rem',
      paddingTop: isMobile ? '80px' : '90px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
      transition: 'background-color 0.3s ease'
    },
    header: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      gap: isMobile ? '1rem' : '2rem',
      marginBottom: '2rem'
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.75rem' : '0.75rem 1.5rem',
      background: darkMode ? '#18181f' : 'white',
      border: darkMode ? '1px solid #2a2a30' : '1px solid #e5e7eb',
      borderRadius: '12px',
      color: darkMode ? '#a0a0b8' : '#4b5563',
      fontWeight: '500',
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      minHeight: '44px'
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      color: darkMode ? '#f0f0fa' : '#1f2937',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    queryText: {
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      color: '#a78bfa',
      fontWeight: '600',
      marginBottom: '0.5rem',
      background: darkMode ? 'rgba(91, 76, 245, 0.2)' : '#e0e7ff',
      display: 'inline-block',
      padding: '0.25rem 1rem',
      borderRadius: '30px',
      wordBreak: 'break-word'
    },
    resultCount: {
      color: darkMode ? '#a0a0b8' : '#6b7280',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '500'
    },
    fuzzyNote: {
      color: darkMode ? '#eab308' : '#b45309',
      fontSize: '0.85rem',
      marginTop: '0.25rem'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '1rem' : '1.5rem'
    },
    resultCard: {
      background: darkMode ? '#18181f' : 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: darkMode ? '1px solid #2a2a30' : '1px solid #e5e7eb',
      cursor: 'pointer',
      display: 'flex',
      gap: '1.25rem'
    },
    resultIcon: {
      fontSize: isMobile ? '1.6rem' : '2rem',
      background: darkMode ? 'rgba(91, 76, 245, 0.15)' : 'linear-gradient(135deg, #667eea20, #764ba220)',
      width: isMobile ? '60px' : '70px',
      height: isMobile ? '60px' : '70px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: '#a78bfa',
      border: darkMode ? '2px solid rgba(91, 76, 245, 0.3)' : '2px solid #667eea30'
    },
    resultContent: { flex: 1, minWidth: 0 },
    resultTitle: {
      fontSize: isMobile ? '1.1rem' : '1.25rem',
      fontWeight: '700',
      color: darkMode ? '#f0f0fa' : '#1f2937',
      marginBottom: '0.25rem',
      lineHeight: '1.3'
    },
    resultSub: {
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      color: '#a78bfa',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    resultDesc: {
      color: darkMode ? '#a0a0b8' : '#6b7280',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      marginBottom: '0.75rem',
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    resultMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
    pill: {
      background: darkMode ? '#1e1e28' : '#f3f4f6',
      padding: '0.25rem 0.7rem',
      borderRadius: '20px',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      fontWeight: '600',
      color: darkMode ? '#a0a0b8' : '#4b5563',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },
    loading: { textAlign: 'center', padding: isMobile ? '3rem 1rem' : '4rem' },
    spinner: {
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      border: darkMode ? '4px solid #1e1e28' : '4px solid #f3f4f6',
      borderTop: '4px solid #a78bfa',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    },
    noResults: {
      textAlign: 'center',
      padding: isMobile ? '3rem 1rem' : '4rem',
      background: darkMode ? '#18181f' : 'white',
      borderRadius: '24px',
      maxWidth: '500px',
      margin: '2rem auto',
      border: darkMode ? '1px solid #2a2a30' : '1px solid #e5e7eb'
    },
    searchAgainBtn: {
      padding: isMobile ? '0.75rem 1.5rem' : '0.75rem 2rem',
      background: 'linear-gradient(135deg, #5b4cf5, #8b5cf6)',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem',
      width: isMobile ? '100%' : 'auto',
      minHeight: '44px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> {!isMobile && 'Back'}
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>
            <FaSearch style={{ color: '#a78bfa' }} />
            {!isMobile ? 'Search Notes & PYQs' : 'Search'}
          </h1>
          <p style={styles.queryText}>"{query}"</p>
          <p style={styles.resultCount}>
            {notes.length} {notes.length === 1 ? 'result' : 'results'} found
          </p>
          {fuzzy && notes.length > 0 && (
            <p style={styles.fuzzyNote}>Showing similar matches for "{query}"</p>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ color: darkMode ? '#a0a0b8' : '#6b7280' }}>Searching...</p>
          </div>
        ) : notes.length > 0 ? (
          <div style={styles.resultsGrid}>
            {notes.map((note) => (
              <div key={note.id} style={styles.resultCard} onClick={() => openNote(note)}>
                <div style={styles.resultIcon}>{typeIcon(note)}</div>
                <div style={styles.resultContent}>
                  <h3 style={styles.resultTitle}>{note.title}</h3>
                  <p style={styles.resultSub}>{note.course_name} • {note.subject_name}</p>
                  {note.description && <p style={styles.resultDesc}>{note.description}</p>}
                  <div style={styles.resultMeta}>
                    <span style={styles.pill}>{note.note_type}</span>
                    <span style={styles.pill}><FaDownload /> {note.downloads}</span>
                    <span style={styles.pill}><FaEye /> {note.views}</span>
                    {note.rating > 0 && (
                      <span style={styles.pill}><FaStar style={{ color: '#eab308' }} /> {note.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <FaSearch style={{ fontSize: '3rem', color: darkMode ? '#3a3a4a' : '#d1d5db', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: darkMode ? '#f0f0fa' : '#374151', marginBottom: '0.5rem' }}>
              No results found
            </h3>
            <p style={{ color: darkMode ? '#a0a0b8' : '#6b7280' }}>
              We couldn't find any notes, PYQs, or materials matching "{query}"
            </p>
            <button style={styles.searchAgainBtn} onClick={() => navigate('/all-materials')}>
              Browse All Materials
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        `}
      </style>
    </div>
  );
};

export default SearchResults;