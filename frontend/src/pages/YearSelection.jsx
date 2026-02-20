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
      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to Courses
        </button>
        <div style={styles.courseInfo}>
          <span style={styles.courseIcon}>{course.icon}</span>
          <h1 style={styles.courseName}>{course.name}</h1>
          <p style={styles.courseDescription}>Select your academic year</p>
          <p style={styles.courseDetails}>
            {course.duration} Years • {course.totalSemesters} Semesters • {course.branches.length} Branches
          </p>
        </div>
      </div>

      {/* Years Grid */}
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
              {['1', '2', '5'].includes(courseId) ? ( // B.Tech, BCA, MCA
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

      {/* Course Info Footer */}
      <div style={styles.footer}>
        <p>
          <strong>{course.name}</strong> • {course.duration} Years • 
          {course.totalSemesters} Semesters • Complete study materials
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#6b7280' }}>
          Available branches: {course.branches.join(', ')}
        </p>
        <div style={styles.courseStats}>
          <span>📅 {course.duration}-Year Program</span>
          <span>📚 {years.length} Academic Years</span>
          <span>🎓 {['4', '5'].includes(courseId) ? 'Postgraduate' : 'Undergraduate'}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'center'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '1rem',
    display: 'inline-block',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#4338ca',
      transform: 'translateX(-5px)'
    }
  },
  courseInfo: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
  },
  courseIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    display: 'inline-block'
  },
  courseName: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  courseDescription: {
    color: '#6b7280',
    fontSize: '1.1rem',
    marginBottom: '0.5rem'
  },
  courseDetails: {
    color: '#4f46e5',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  yearsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem'
  },
  yearCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      borderColor: '#4f46e5'
    }
  },
  yearNumberCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  yearNumber: {
    color: '#1f2937'
  },
  yearName: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  yearDescription: {
    color: '#6b7280',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  },
  materialsPreview: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    margin: '1rem 0'
  },
  materialBadge: {
    background: '#f3f4f6',
    color: '#4b5563',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.75rem',
    border: '1px solid #e5e7eb'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    margin: '1rem 0',
    fontSize: '0.9rem',
    color: '#666'
  },
  stat: {
    background: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px'
  },
  selectButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    fontWeight: '500',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    }
  },
  footer: {
    textAlign: 'center',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    color: '#6b7280'
  },
  courseStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#4f46e5'
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