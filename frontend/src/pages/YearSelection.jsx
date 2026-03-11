// src/pages/YearSelection.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseYears as getCourseYearsFromConfig } from '../config/config';
import { getCourseYears as getCourseYearsFromAPI } from '../services/api';

const YearSelection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Use config for course data
      const courseData = getCourseById(courseId);
      
      if (!courseData) {
        throw new Error('Course not found');
      }

      setCourse(courseData);

      // Try to get years from API, fallback to config
      let yearsData;
      try {
        yearsData = await getCourseYearsFromAPI(courseId);
      } catch (apiError) {
        console.log('API failed, using config data');
        // Use config function if API fails
        yearsData = getCourseYearsFromConfig(courseId);
      }

      // IMPORTANT: Filter years based on course duration
      // Only show years that exist for this course
      const validYears = yearsData.filter(year => {
        const yearNum = typeof year === 'object' ? (year.id || year.year_id) : year;
        return yearNum <= courseData.duration;
      });

      // Format years data
      const formattedYears = validYears.map(year => {
        const yearNum = typeof year === 'object' ? (year.id || year.year_id) : year;
        return {
          id: yearNum,
          name: year.name || `Year ${yearNum}`,
          subjects: year.subjects || (yearNum === 1 ? 8 : yearNum === 2 ? 7 : 6),
          description: `${courseData.name} Year ${yearNum} complete materials`,
          materials: year.materials || (200 + (yearNum * 50))
        };
      });

      setYears(formattedYears);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearClick = (yearId) => {
    navigate(`/course/${courseId}/year/${yearId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading course information...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.errorContainer}>
        <h3>Course not found!</h3>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to Courses
        </button>
      </div>
    );
  }

  // If no years available for this course
  if (years.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <h3>No Years Available</h3>
        <p>No academic years found for {course.name}.</p>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Compact Header */}
      <div style={styles.compactHeader}>
        <button onClick={handleBack} style={styles.compactBackButton}>
          ← Back to Courses
        </button>
        <div style={styles.compactCourseInfo}>
          <span style={styles.compactCourseIcon}>{course.icon}</span>
          <span style={styles.compactCourseName}>{course.name}</span>
          <span style={styles.compactCourseDetails}>
            {course.duration} Years • {course.totalSemesters} Semesters
          </span>
        </div>
      </div>

      {/* Years Grid - Ab upar se shuru */}
      <div style={styles.yearsGrid}>
        {years.map((year) => (
          <div
            key={year.id}
            style={styles.yearCard}
            onClick={() => handleYearClick(year.id)}
          >
            <div style={{
              ...styles.yearNumberCircle,
              background: `linear-gradient(135deg, ${course.color}40, ${course.color}80)`,
              border: `3px solid ${course.color}`
            }}>
              <span style={styles.yearNumber}>{year.id}</span>
            </div>
            <h3 style={styles.yearName}>{year.name}</h3>
            <p style={styles.yearDescription}>{year.description}</p>
            
            <div style={styles.materialsPreview}>
              <span style={styles.materialBadge}>📋 Syllabus</span>
              <span style={styles.materialBadge}>📚 Notes</span>
              <span style={styles.materialBadge}>📝 PYQs</span>
              {['1', '2', '5'].includes(courseId) ? (
                <span style={styles.materialBadge}>🔬 Labs</span>
              ) : (
                <span style={styles.materialBadge}>📊 Cases</span>
              )}
            </div>

            <div style={styles.stats}>
              <span style={styles.stat}>📚 {year.subjects} Subjects</span>
              <span style={styles.stat}>📄 {year.materials}+ Notes</span>
            </div>

            <button style={{
              ...styles.selectButton,
              background: `linear-gradient(90deg, ${course.color}, ${course.color}DD)`,
              border: `2px solid ${course.color}30`
            }}>
              Select Year {year.id} →
            </button>
          </div>
        ))}
      </div>

      {/* Simple Footer */}
      <div style={styles.simpleFooter}>
        <p>
          <strong>{course.name}</strong> • {course.duration} Years • Complete study materials
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.5rem 1rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  
  // Compact Header
  compactHeader: {
    marginBottom: '2rem',
  },
  compactBackButton: {
    padding: '0.4rem 1rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    display: 'inline-block',
    transition: 'all 0.3s'
  },
  compactCourseInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    width: 'fit-content',
    margin: '0 auto'
  },
  compactCourseIcon: {
    fontSize: '1.2rem',
  },
  compactCourseName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  compactCourseDetails: {
    fontSize: '0.8rem',
    color: '#6b7280',
    borderLeft: '1px solid #e5e7eb',
    paddingLeft: '0.75rem',
  },
  
  // Years Grid
  yearsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  yearCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #e5e7eb'
  },
  yearNumberCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.8rem',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  yearNumber: {
    color: '#1f2937'
  },
  yearName: {
    fontSize: '1.2rem',
    marginBottom: '0.3rem',
    color: '#1f2937',
    fontWeight: '600'
  },
  yearDescription: {
    color: '#6b7280',
    marginBottom: '0.8rem',
    fontSize: '0.8rem',
  },
  materialsPreview: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '0.4rem',
    margin: '0.8rem 0'
  },
  materialBadge: {
    background: '#f3f4f6',
    color: '#4b5563',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    border: '1px solid #e5e7eb',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.8rem',
    margin: '0.8rem 0',
    fontSize: '0.8rem',
    color: '#666',
    flexWrap: 'wrap'
  },
  stat: {
    background: '#f3f4f6',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
  },
  selectButton: {
    marginTop: '0.8rem',
    padding: '0.6rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  
  // Simple Footer
  simpleFooter: {
    textAlign: 'center',
    padding: '1rem',
    background: 'white',
    borderRadius: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    color: '#6b7280',
    fontSize: '0.85rem'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  }
};

export default YearSelection;