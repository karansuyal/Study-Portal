import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const styles = {
    container: {
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    },
    content: {
      maxWidth: '500px'
    },
    errorCode: {
      fontSize: '6rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '2rem',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    message: {
      color: '#6b7280',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    button: {
      display: 'inline-block',
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={styles.button}>
          ← Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;