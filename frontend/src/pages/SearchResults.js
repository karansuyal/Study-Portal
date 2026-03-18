// SearchResults.js - Fixed B.Tech Search
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaGraduationCap } from 'react-icons/fa';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = (searchQuery) => {
    setLoading(true);
    
    // ✅ 5 COURSES with multiple search variations
    const courses = [
      { 
        id: 1, 
        type: 'course', 
        title: 'BCA', 
        fullTitle: 'Bachelor of Computer Applications',
        description: '3 years undergraduate program in Computer Applications', 
        icon: '📱', 
        path: '/course/2',
        duration: '3 Years',
        subjects: 'Programming, Web Development, Database',
        // ✅ Search keywords for BCA
        keywords: ['bca', 'bachelor', 'computer applications', 'computer', 'applications']
      },
      { 
        id: 2, 
        type: 'course', 
        title: 'BBA', 
        fullTitle: 'Bachelor of Business Administration',
        description: '3 years undergraduate program in Business Management', 
        icon: '📊', 
        path: '/course/3',
        duration: '3 Years',
        subjects: 'Marketing, Finance, HR',
        // ✅ Search keywords for BBA
        keywords: ['bba', 'bachelor', 'business', 'administration', 'management']
      },
      { 
        id: 3, 
        type: 'course', 
        title: 'B.Tech', 
        fullTitle: 'Bachelor of Technology',
        description: '4 years engineering program in various specializations', 
        icon: '💻', 
        path: '/course/1',
        duration: '4 Years',
        subjects: 'Computer Science, Electronics, Mechanical',
        // ✅ FIXED: B.Tech ke saare variations include kiye
        keywords: [
          'b.tech', 'btech', 'bt', 'tech', 'bachelor', 
          'technology', 'engineering', 'engineer', 'be', 'b.e',
          'bachelor of technology', 'b tech'
        ]
      },
      { 
        id: 4, 
        type: 'course', 
        title: 'MBA', 
        fullTitle: 'Master of Business Administration',
        description: '2 years postgraduate program in Business Management', 
        icon: '🎓', 
        path: '/course/4',
        duration: '2 Years',
        subjects: 'Leadership, Strategy, Operations',
        // ✅ Search keywords for MBA
        keywords: ['mba', 'master', 'business', 'administration', 'postgraduate']
      },
      { 
        id: 5, 
        type: 'course', 
        title: 'MCA', 
        fullTitle: 'Master of Computer Applications',
        description: '2 years postgraduate program in Computer Applications', 
        icon: '💼', 
        path: '/course/5',
        duration: '2 Years',
        subjects: 'Advanced Programming, AI, Networking',
        // ✅ Search keywords for MCA
        keywords: ['mca', 'master', 'computer', 'applications', 'postgraduate']
      }
    ];

    // ✅ IMPROVED SEARCH: Multiple fields me search karo
    const searchLower = searchQuery.toLowerCase().trim();
    
    const filteredResults = courses.filter(course => {
      // Basic fields me search
      const titleMatch = course.title.toLowerCase().includes(searchLower);
      const fullTitleMatch = course.fullTitle.toLowerCase().includes(searchLower);
      const descMatch = course.description.toLowerCase().includes(searchLower);
      const subjectsMatch = course.subjects.toLowerCase().includes(searchLower);
      
      // ✅ Keywords me search (B.Tech ke liye special)
      const keywordMatch = course.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower) || 
        searchLower.includes(keyword.toLowerCase())
      );
      
      // ✅ Special case for B.Tech variations
      const btechVariations = [
        'b.tech', 'btech', 'b tech', 'bt', 'b.tech', 'b. tech',
        'bachelor of technology', 'be', 'b.e', 'b.e.', 'engineering'
      ];
      
      // Agar B.Tech course hai to special handling
      if (course.title === 'B.Tech') {
        const btechMatch = btechVariations.some(variant => 
          searchLower.includes(variant) || variant.includes(searchLower)
        );
        return btechMatch || titleMatch || fullTitleMatch || descMatch || subjectsMatch || keywordMatch;
      }
      
      // Normal search for other courses
      return titleMatch || fullTitleMatch || descMatch || subjectsMatch || keywordMatch;
    });

    console.log(`Search for "${searchQuery}" found ${filteredResults.length} courses`);

    setTimeout(() => {
      setResults(filteredResults);
      setLoading(false);
    }, 500);
  };

  const isMobile = windowWidth <= 768;

  // Styles
  const styles = {
    container: {
      padding: isMobile ? '1rem' : '2rem',
      paddingTop: isMobile ? '80px' : '90px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
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
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      color: '#4b5563',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      width: isMobile ? '100%' : 'auto',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      minHeight: '44px'
    },
    searchQuery: {
      flex: 1
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      color: '#1f2937',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    queryText: {
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      color: '#4f46e5',
      fontWeight: '600',
      marginBottom: '0.5rem',
      background: '#e0e7ff',
      display: 'inline-block',
      padding: '0.25rem 1rem',
      borderRadius: '30px',
      wordBreak: 'break-word'
    },
    resultCount: {
      color: '#6b7280',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '500'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '1rem' : '1.5rem'
    },
    resultCard: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      gap: '1.25rem',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    },
    resultIcon: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      background: 'linear-gradient(135deg, #667eea20, #764ba220)',
      width: isMobile ? '70px' : '80px',
      height: isMobile ? '70px' : '80px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: '2px solid #667eea30'
    },
    resultContent: {
      flex: 1,
      minWidth: 0
    },
    resultTitle: {
      fontSize: isMobile ? '1.3rem' : '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.25rem',
      lineHeight: '1.3'
    },
    resultFullTitle: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      color: '#4f46e5',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    resultDesc: {
      color: '#6b7280',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      marginBottom: '0.75rem',
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    resultMeta: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    duration: {
      background: '#f3f4f6',
      padding: '0.3rem 0.8rem',
      borderRadius: '20px',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      fontWeight: '600',
      color: '#4b5563'
    },
    type: {
      background: '#667eea20',
      padding: '0.3rem 0.8rem',
      borderRadius: '20px',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      fontWeight: '600',
      color: '#4f46e5',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },
    loading: {
      textAlign: 'center',
      padding: isMobile ? '3rem 1rem' : '4rem'
    },
    spinner: {
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    },
    noResults: {
      textAlign: 'center',
      padding: isMobile ? '3rem 1rem' : '4rem',
      background: 'white',
      borderRadius: '24px',
      maxWidth: '500px',
      margin: '2rem auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    },
    suggestionsBox: {
      background: '#f3f4f6',
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem',
      textAlign: 'left'
    },
    suggestionTitle: {
      fontSize: '0.9rem',
      color: '#4b5563',
      marginBottom: '0.5rem',
      fontWeight: '600'
    },
    suggestionTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    suggestionTag: {
      background: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      color: '#4f46e5',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    searchAgainBtn: {
      padding: isMobile ? '0.75rem 1.5rem' : '0.75rem 2rem',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '1.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem',
      width: isMobile ? '100%' : 'auto',
      minHeight: '44px'
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button 
          style={styles.backBtn}
          onClick={() => navigate(-1)}
          onTouchStart={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaArrowLeft /> {!isMobile && 'Back'}
        </button>
        
        <div style={styles.searchQuery}>
          <h1 style={styles.title}>
            <FaSearch style={{ color: '#4f46e5' }} /> 
            {!isMobile ? 'Search Courses' : 'Search'}
          </h1>
          <p style={styles.queryText}>"{query}"</p>
          <p style={styles.resultCount}>
            {results.length} {results.length === 1 ? 'course' : 'courses'} found
          </p>
        </div>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '1rem' : '1.1rem' }}>
              Searching for courses...
            </p>
          </div>
        ) : results.length > 0 ? (
          <div style={styles.resultsGrid}>
            {results.map((course) => (
              <div 
                key={course.id} 
                style={styles.resultCard}
                onClick={() => navigate(course.path)}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={styles.resultIcon}>{course.icon}</div>
                <div style={styles.resultContent}>
                  <h3 style={styles.resultTitle}>{course.title}</h3>
                  <p style={styles.resultFullTitle}>{course.fullTitle}</p>
                  <p style={styles.resultDesc}>{course.description}</p>
                  <div style={styles.resultMeta}>
                    <span style={styles.duration}>
                      📅 {course.duration}
                    </span>
                    <span style={styles.type}>
                      <FaGraduationCap /> Course
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <FaGraduationCap style={{ fontSize: isMobile ? '3rem' : '4rem', color: '#d1d5db', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
              No courses found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
              We couldn't find any courses matching "{query}"
            </p>
            
            {/* Suggestions */}
            <div style={styles.suggestionsBox}>
              <p style={styles.suggestionTitle}>Try searching:</p>
              <div style={styles.suggestionTags}>
                {['BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'btech', 'b.tech', 'engineering'].map((suggestion) => (
                  <span
                    key={suggestion}
                    style={styles.suggestionTag}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = '#4f46e5';
                      e.currentTarget.style.color = 'white';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#4f46e5';
                    }}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>

            <button 
              style={styles.searchAgainBtn}
              onClick={() => navigate('/')}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Browse All Courses
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
          }
          
          body {
            background-color: #f9fafb;
          }
        `}
      </style>
    </div>
  );
};

export default SearchResults;