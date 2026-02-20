// SearchResults.js (fixed version)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBook, FaFileAlt, FaHistory, FaArrowLeft } from 'react-icons/fa';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = (searchQuery) => {
    setLoading(true);
    
    // ✅ FIXED: Ab saare courses include kiye - BCA, BBA, B.Tech, MBA, MCA sab
    const mockResults = [
      // Courses - ALL COURSES
      { id: 1, type: 'course', title: 'BCA', description: 'Bachelor of Computer Applications - 3 years program', icon: '📱', path: '/course/2' },
      { id: 2, type: 'course', title: 'BBA', description: 'Bachelor of Business Administration - 3 years program', icon: '📊', path: '/course/3' },
      { id: 3, type: 'course', title: 'B.Tech Computer Science', description: 'Bachelor of Technology in CSE - 4 years program', icon: '💻', path: '/course/1' },
      { id: 4, type: 'course', title: 'B.Tech Information Technology', description: 'Bachelor of Technology in IT - 4 years program', icon: '💻', path: '/course/6' },
      { id: 5, type: 'course', title: 'B.Tech Electronics', description: 'Bachelor of Technology in ECE - 4 years program', icon: '🔌', path: '/course/3' },
      { id: 6, type: 'course', title: 'B.Tech Mechanical', description: 'Bachelor of Technology in ME - 4 years program', icon: '⚙️', path: '/course/4' },
      { id: 7, type: 'course', title: 'B.Tech Civil', description: 'Bachelor of Technology in CE - 4 years program', icon: '🏗️', path: '/course/5' },
      { id: 8, type: 'course', title: 'MBA', description: 'Master of Business Administration - 2 years program', icon: '🎓', path: '/course/4' },
      { id: 9, type: 'course', title: 'MCA', description: 'Master of Computer Applications - 2 years program', icon: '💼', path: '/course/5' },
      { id: 10, type: 'course', title: 'B.Com', description: 'Bachelor of Commerce - 3 years program', icon: '💰', path: '/course/13' },
      { id: 11, type: 'course', title: 'BA Economics', description: 'Bachelor of Arts in Economics - 3 years program', icon: '📊', path: '/course/16' },
      { id: 12, type: 'course', title: 'BA English', description: 'Bachelor of Arts in English - 3 years program', icon: '📖', path: '/course/15' },
      
      // Subjects
      { id: 101, type: 'subject', title: 'Data Structures', description: 'B.Tech CSE Semester 3 - Important subject for coding', icon: '📚', path: '/course/1/year/2/sem/3' },
      { id: 102, type: 'subject', title: 'Algorithms', description: 'B.Tech CSE Semester 4 - Design and Analysis', icon: '📐', path: '/course/1/year/2/sem/4' },
      { id: 103, type: 'subject', title: 'Digital Electronics', description: 'B.Tech ECE Semester 2 - Logic gates and circuits', icon: '🔌', path: '/course/1/year/1/sem/2' },
      { id: 104, type: 'subject', title: 'Programming in C', description: 'BCA Semester 1 - Fundamentals of C programming', icon: '💻', path: '/course/2/year/1/sem/1' },
      { id: 105, type: 'subject', title: 'C++ Programming', description: 'BCA Semester 2 - Object oriented programming', icon: '⚡', path: '/course/2/year/1/sem/2' },
      { id: 106, type: 'subject', title: 'Java Programming', description: 'BCA Semester 3 - Core Java concepts', icon: '☕', path: '/course/2/year/2/sem/3' },
      { id: 107, type: 'subject', title: 'Python Programming', description: 'BCA Semester 4 - Python for beginners', icon: '🐍', path: '/course/2/year/2/sem/4' },
      { id: 108, type: 'subject', title: 'Web Development', description: 'BCA Semester 5 - HTML, CSS, JavaScript', icon: '🌐', path: '/course/2/year/3/sem/5' },
      { id: 109, type: 'subject', title: 'Marketing Management', description: 'MBA Semester 1 - Marketing principles', icon: '📊', path: '/course/4/year/1/sem/1' },
      { id: 110, type: 'subject', title: 'Financial Management', description: 'MBA Semester 2 - Finance fundamentals', icon: '💰', path: '/course/4/year/1/sem/2' },
      { id: 111, type: 'subject', title: 'Human Resources', description: 'MBA Semester 3 - HR management', icon: '👥', path: '/course/4/year/2/sem/3' },
      { id: 112, type: 'subject', title: 'Business Economics', description: 'BBA Semester 2 - Micro and macro economics', icon: '📈', path: '/course/3/year/1/sem/2' },
      
      // Notes
      { id: 201, type: 'notes', title: 'C Programming Notes', description: 'Complete notes with examples and programs', icon: '📝', path: '/materials/101' },
      { id: 202, type: 'notes', title: 'Data Structures Notes', description: 'Arrays, Linked Lists, Trees, Graphs', icon: '📝', path: '/materials/102' },
      { id: 203, type: 'notes', title: 'Java Programming Notes', description: 'OOP concepts, Collections, Multithreading', icon: '📝', path: '/materials/103' },
      { id: 204, type: 'notes', title: 'Python Notes', description: 'Basics to advanced Python', icon: '📝', path: '/materials/104' },
      { id: 205, type: 'notes', title: 'Marketing Notes', description: 'Marketing strategies and concepts', icon: '📝', path: '/materials/105' },
      
      // PYQs
      { id: 301, type: 'pyq', title: 'BCA PYQs 2023', description: 'Previous year question papers - All semesters', icon: '📄', path: '/pyqs/2023' },
      { id: 302, type: 'pyq', title: 'B.Tech PYQs 2023', description: 'Engineering previous year papers', icon: '📄', path: '/pyqs/2023/engineering' },
      { id: 303, type: 'pyq', title: 'MBA PYQs 2023', description: 'Management previous year papers', icon: '📄', path: '/pyqs/2023/mba' },
      { id: 304, type: 'pyq', title: 'BBA PYQs 2023', description: 'Business Administration papers', icon: '📄', path: '/pyqs/2023/bba' },
      { id: 305, type: 'pyq', title: 'MCA PYQs 2023', description: 'Computer Applications papers', icon: '📄', path: '/pyqs/2023/mca' },
    ];

    // ✅ FIXED: Case insensitive search - saari fields mein search karo
    const filteredResults = mockResults.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.type === 'course' && item.title.toLowerCase().includes(searchLower))
      );
    });

    console.log(`Search for "${searchQuery}" found ${filteredResults.length} results`);

    setTimeout(() => {
      setResults(filteredResults);
      setLoading(false);
    }, 500);
  };

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(item => item.type === activeFilter);

  // Styles
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '90px',
      fontFamily: "'Inter', sans-serif",
      minHeight: '80vh'
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '2rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '8px',
      color: '#4b5563',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    searchQuery: {
      flex: 1
    },
    title: {
      fontSize: '2rem',
      color: '#1f2937',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    queryText: {
      fontSize: '1.5rem',
      color: '#4f46e5',
      fontWeight: '700',
      marginBottom: '0.5rem',
      background: '#e0e7ff',
      display: 'inline-block',
      padding: '0.25rem 1rem',
      borderRadius: '30px'
    },
    resultCount: {
      color: '#6b7280',
      fontSize: '1rem',
      fontWeight: '500'
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '1rem'
    },
    filterBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#f3f4f6',
      border: '2px solid transparent',
      borderRadius: '30px',
      color: '#4b5563',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '0.95rem'
    },
    activeFilter: {
      background: '#4f46e5',
      color: 'white',
      borderColor: '#4f46e5',
      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    resultCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      gap: '1.2rem',
    },
    resultIcon: {
      fontSize: '2.2rem',
      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
      width: '70px',
      height: '70px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    resultContent: {
      flex: 1
    },
    resultTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    resultDesc: {
      color: '#6b7280',
      fontSize: '0.9rem',
      marginBottom: '0.75rem',
      lineHeight: '1.5'
    },
    resultType: {
      display: 'inline-block',
      padding: '0.35rem 1rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem'
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    },
    noResults: {
      textAlign: 'center',
      padding: '4rem',
      background: '#f9fafb',
      borderRadius: '16px',
      maxWidth: '500px',
      margin: '2rem auto'
    },
    searchAgainBtn: {
      padding: '0.75rem 2rem',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '1.5rem',
      fontSize: '1rem'
    }
  };

  // Type colors mapping
  const typeColors = {
    course: { bg: '#dbeafe', color: '#1d4ed8', label: '📚 Course' },
    subject: { bg: '#dcfce7', color: '#166534', label: '📖 Subject' },
    notes: { bg: '#fef3c7', color: '#92400e', label: '📝 Notes' },
    pyq: { bg: '#e0e7ff', color: '#4f46e5', label: '📄 PYQ' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button 
          style={styles.backBtn}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <FaArrowLeft /> Back
        </button>
        
        <div style={styles.searchQuery}>
          <h1 style={styles.title}>
            <FaSearch style={{ color: '#4f46e5' }} /> Search Results
          </h1>
          <p style={styles.queryText}>"{query}"</p>
          <p style={styles.resultCount}>
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button 
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'all' ? styles.activeFilter : {})
          }}
          onClick={() => setActiveFilter('all')}
        >
          All ({results.length})
        </button>
        <button 
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'course' ? styles.activeFilter : {})
          }}
          onClick={() => setActiveFilter('course')}
        >
          <FaBook /> Courses ({results.filter(r => r.type === 'course').length})
        </button>
        <button 
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'subject' ? styles.activeFilter : {})
          }}
          onClick={() => setActiveFilter('subject')}
        >
          📚 Subjects ({results.filter(r => r.type === 'subject').length})
        </button>
        <button 
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'notes' ? styles.activeFilter : {})
          }}
          onClick={() => setActiveFilter('notes')}
        >
          <FaFileAlt /> Notes ({results.filter(r => r.type === 'notes').length})
        </button>
        <button 
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'pyq' ? styles.activeFilter : {})
          }}
          onClick={() => setActiveFilter('pyq')}
        >
          <FaHistory /> PYQs ({results.filter(r => r.type === 'pyq').length})
        </button>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Searching for "{query}"...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div style={styles.resultsGrid}>
            {filteredResults.map((item) => {
              const typeStyle = typeColors[item.type] || { bg: '#f3f4f6', color: '#6b7280' };

              return (
                <div 
                  key={item.id} 
                  style={styles.resultCard}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 70, 229, 0.15)';
                    e.currentTarget.style.borderColor = '#4f46e5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={styles.resultIcon}>{item.icon}</div>
                  <div style={styles.resultContent}>
                    <h3 style={styles.resultTitle}>{item.title}</h3>
                    <p style={styles.resultDesc}>{item.description}</p>
                    <span style={{
                      ...styles.resultType,
                      background: typeStyle.bg,
                      color: typeStyle.color
                    }}>
                      {typeStyle.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noResults}>
            <FaSearch style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
              No results found for "{query}"
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Try searching with different keywords
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Suggestions: BCA, BBA, B.Tech, MBA, MCA, C Programming, Data Structures
            </p>
            <button 
              style={styles.searchAgainBtn}
              onClick={() => navigate('/')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Search Again
            </button>
          </div>
        )}
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
    </div>
  );
};

export default SearchResults;