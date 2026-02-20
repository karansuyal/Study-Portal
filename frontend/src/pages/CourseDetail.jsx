import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
      color: '#4f46e5',
      textDecoration: 'none'
    },
    courseHeader: {
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      color: 'white',
      padding: '2rem',
      borderRadius: '10px',
      marginBottom: '2rem'
    },
    courseTitle: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      background: 'none',
      border: 'none',
      fontSize: '1rem',
      cursor: 'pointer',
      borderBottom: '3px solid transparent'
    },
    activeTab: {
      borderBottom: '3px solid #4f46e5',
      color: '#4f46e5',
      fontWeight: '500'
    },
    content: {
      background: 'white',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/courses" style={styles.backButton}>
        ← Back to Courses
      </Link>

      <div style={styles.courseHeader}>
        <h1 style={styles.courseTitle}>Course Name {id}</h1>
        <p>Computer Science Engineering • Semester 3</p>
      </div>

      <div style={styles.tabs}>
        <button style={{...styles.tab, ...styles.activeTab}}>Notes</button>
        <button style={styles.tab}>PYQs</button>
        <button style={styles.tab}>Syllabus</button>
        <button style={styles.tab}>Assignments</button>
      </div>

      <div style={styles.content}>
        <h2>Course Materials</h2>
        <p>This page will show all study materials for this course.</p>
        <p>Under construction...</p>
      </div>
    </div>
  );
};

export default CourseDetail;