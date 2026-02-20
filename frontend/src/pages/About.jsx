import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: '80vh'
    },
    hero: {
      textAlign: 'center',
      padding: '3rem 1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '15px',
      marginBottom: '3rem'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    heroSubtitle: {
      fontSize: '1.2rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontSize: '2rem',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem'
    },
    featureCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)'
      }
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4f46e5',
      marginBottom: '0.5rem'
    },
    teamCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '0 auto'
    },
    avatar: {
      width: '120px',
      height: '120px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      borderRadius: '50%',
      margin: '0 auto 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: 'white',
      fontWeight: 'bold'
    },
    cta: {
      textAlign: 'center',
      padding: '3rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '15px',
      marginTop: '3rem'
    },
    ctaButton: {
      display: 'inline-block',
      background: '#4f46e5',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      marginTop: '1rem',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 5px 15px rgba(79, 70, 229, 0.4)'
      }
    }
  };

  const features = [
    { icon: '📚', title: 'Comprehensive Notes', desc: 'Detailed notes for all subjects and chapters' },
    { icon: '📝', title: 'PYQs with Solutions', desc: 'Previous year questions with detailed solutions' },
    { icon: '📋', title: 'Updated Syllabus', desc: 'Latest syllabus for all engineering branches' },
    { icon: '⬇️', title: 'Easy Downloads', desc: 'One-click downloads for all materials' },
    { icon: '🔍', title: 'Smart Search', desc: 'Find exactly what you need quickly' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Access from any device, anywhere' },
    { icon: '🆓', title: 'Completely Free', desc: 'All resources free forever' },
    { icon: '👥', title: 'Community Driven', desc: 'By students, for students' }
  ];

  const stats = [
    { number: '500+', label: 'Study Materials' },
    { number: '50+', label: 'Courses Covered' },
    { number: '1000+', label: 'Student Users' },
    { number: '5000+', label: 'Total Downloads' }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About Study Portal</h1>
        <p style={styles.heroSubtitle}>
          Your ultimate study companion platform. Created by students, for students.
          Free, open, and community-driven.
        </p>
      </section>

      {/* Mission Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🌍 Our Mission</h2>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#4b5563'
        }}>
          <p>
            To democratize education by making quality study materials accessible to every student for free.
            We believe knowledge should be shared, not sold.
          </p>
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>✨ What We Offer</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>{feature.title}</h3>
              <p style={{ color: '#6b7280' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 Platform Statistics</h2>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={{ color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>👨‍💻 Created By</h2>
        <div style={styles.teamCard}>
          <div style={styles.avatar}>S</div>
          <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>Karan Suyal</h3>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Full Stack Developer & Student
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
              BCA  in Computer Science • Passionate about EdTech
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <a href="mailto:studyportal02@gmail.com" style={{
              color: '#4f46e5',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              📧 Email
            </a>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>
          Ready to join our learning community?
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
          Start uploading your notes, download study materials, and help other students succeed.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/upload" style={styles.ctaButton}>
            📤 Upload Notes
          </Link>
          <Link to="/courses" style={{ ...styles.ctaButton, background: '#10b981' }}>
            📚 Browse Courses
          </Link>
          <Link to="/register" style={{ ...styles.ctaButton, background: '#f59e0b' }}>
            👤 Join Now
          </Link>
        </div>
      </section>

      {/* Footer Note */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280',
        fontSize: '0.9rem'
      }}>
        <p>
          Made with ❤️ for students everywhere. 
          Study Portal is an open-source project. 
          Contribute on <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>GitHub</a>.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          © {new Date().getFullYear()} Study Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default About;