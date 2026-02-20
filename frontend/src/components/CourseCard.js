import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  // 🎯 Professional educational icons based on course
  const getCourseIcon = (name) => {
    const nameLower = name?.toLowerCase() || '';
    
    // Engineering
    if (nameLower.includes('btech') || nameLower.includes('b.tech')) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    // Computer Applications
    if (nameLower.includes('bca') || nameLower.includes('mca')) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="18" rx="2" ry="2" stroke="white" strokeWidth="2"/>
          <line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="17" x2="12" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // Business/Management
    if (nameLower.includes('bba') || nameLower.includes('mba')) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8C20.9996 7.6493 20.9071 7.30481 20.7315 7.00122C20.556 6.69763 20.3037 6.44539 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44539 3.44398 6.69763 3.26846 7.00122C3.09294 7.30481 3.00036 7.6493 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3024 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3024 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11L3 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 6L12 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    // Commerce
    if (nameLower.includes('b.com') || nameLower.includes('bcom') || nameLower.includes('commerce')) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
          <path d="M12 6V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 8H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 16H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // Arts/Humanities
    if (nameLower.includes('ba') || nameLower.includes('ma')) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>
      );
    }
    
    // Default - Graduation Cap
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 9L12 5L2 9L12 13L22 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12V16C6 16 8 18 12 18C16 18 18 16 18 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  // Format course name
  const formatCourseName = (name) => {
    if (!name) return '';
    if (name.toLowerCase().includes('btech') || name.toLowerCase().includes('b.tech')) return 'B.Tech';
    if (name.toLowerCase().includes('bca')) return 'BCA';
    if (name.toLowerCase().includes('bba')) return 'BBA';
    if (name.toLowerCase().includes('mba')) return 'MBA';
    if (name.toLowerCase().includes('mca')) return 'MCA';
    if (name.toLowerCase().includes('b.com') || name.toLowerCase().includes('bcom')) return 'B.Com';
    if (name.toLowerCase().includes('ba')) return 'BA';
    if (name.toLowerCase().includes('ma')) return 'MA';
    return name;
  };

  const styles = {
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem 1.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #eef2f6',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '240px'
    },
    iconWrapper: {
      background: 'linear-gradient(145deg, #4f46e5, #6366f1)',
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.2rem',
      boxShadow: '0 15px 25px rgba(79, 70, 229, 0.25)',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '1.6rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.5rem',
      letterSpacing: '-0.02em',
      fontFamily: "'Inter', sans-serif"
    },
    clickHint: {
      fontSize: '0.85rem',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      marginTop: '0.5rem',
      padding: '0.4rem 1rem',
      background: '#f8fafc',
      borderRadius: '30px',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div 
      style={styles.card} 
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(79, 70, 229, 0.15)';
        e.currentTarget.style.borderColor = '#4f46e5';
        
        // Icon hover effect
        const icon = e.currentTarget.querySelector('.course-icon');
        if (icon) {
          icon.style.transform = 'scale(1.1)';
          icon.style.boxShadow = '0 20px 30px rgba(79, 70, 229, 0.35)';
        }
        
        // Hint hover effect
        const hint = e.currentTarget.querySelector('.click-hint');
        if (hint) {
          hint.style.background = '#4f46e5';
          hint.style.color = 'white';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#eef2f6';
        
        // Icon hover effect reset
        const icon = e.currentTarget.querySelector('.course-icon');
        if (icon) {
          icon.style.transform = 'scale(1)';
          icon.style.boxShadow = '0 15px 25px rgba(79, 70, 229, 0.25)';
        }
        
        // Hint hover effect reset
        const hint = e.currentTarget.querySelector('.click-hint');
        if (hint) {
          hint.style.background = '#f8fafc';
          hint.style.color = '#64748b';
        }
      }}
    >
      {/* Icon with SVG */}
      <div 
        className="course-icon"
        style={styles.iconWrapper}
      >
        {getCourseIcon(course.name)}
      </div>

      {/* Course Name */}
      <h3 style={styles.title}>{formatCourseName(course.name)}</h3>

      {/* Click Hint */}
      <div className="click-hint" style={styles.clickHint}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>View Course</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>

      {/* Add Google Font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}
      </style>
    </div>
  );
};

export default CourseCard;