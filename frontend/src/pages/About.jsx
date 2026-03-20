import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // 🔥 TERI ORIGINAL STYLES - BAS MOBILE KE LIYE RESPONSIVE BANAYA
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '1rem' : '2rem 1rem',
      minHeight: '80vh'
    },
    hero: {
      textAlign: 'center',
      padding: isMobile ? '2rem 1rem' : '3rem 1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: isMobile ? '12px' : '15px',
      marginBottom: isMobile ? '2rem' : '3rem'
    },
    heroTitle: {
      fontSize: isMobile ? '2rem' : '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    heroSubtitle: {
      fontSize: isMobile ? '1rem' : '1.2rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto',
      padding: isMobile ? '0 0.5rem' : '0'
    },
    section: {
      marginBottom: isMobile ? '2rem' : '3rem'
    },
    sectionTitle: {
      fontSize: isMobile ? '1.8rem' : '2rem',
      color: '#1f2937',
      marginBottom: isMobile ? '1.2rem' : '1.5rem',
      textAlign: 'center'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: isMobile ? '1rem' : '2rem',
      marginBottom: '3rem'
    },
    featureCard: {
      background: 'white',
      padding: isMobile ? '1.5rem' : '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s',
      cursor: 'pointer',
      border: '1px solid #e5e7eb'
    },
    featureIcon: {
      fontSize: isMobile ? '2.5rem' : '3rem',
      marginBottom: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '0.8rem' : '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      background: 'white',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    statNumber: {
      fontSize: isMobile ? '1.8rem' : '2.5rem',
      fontWeight: 'bold',
      color: '#4f46e5',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: isMobile ? '0.8rem' : '1rem',
      color: '#6b7280'
    },
    teamCard: {
      background: 'white',
      padding: isMobile ? '1.5rem' : '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '0 auto',
      border: '1px solid #e5e7eb'
    },
    avatar: {
      width: isMobile ? '100px' : '120px',
      height: isMobile ? '100px' : '120px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      borderRadius: '50%',
      margin: '0 auto 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '2.5rem' : '3rem',
      color: 'white',
      fontWeight: 'bold'
    },
    cta: {
      textAlign: 'center',
      padding: isMobile ? '1.5rem' : '3rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '15px',
      marginTop: '3rem'
    },
    ctaButtons: {
      display: 'flex',
      gap: isMobile ? '0.8rem' : '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row'
    },
    ctaButton: {
      display: 'inline-block',
      background: '#4f46e5',
      color: 'white',
      padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: isMobile ? '0.9rem' : '1.1rem',
      marginTop: '1rem',
      transition: 'all 0.3s',
      textAlign: 'center',
      width: isMobile ? '100%' : 'auto'
    },
    missionText: {
      background: 'white',
      padding: isMobile ? '1.5rem' : '2rem',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center',
      fontSize: isMobile ? '1rem' : '1.1rem',
      lineHeight: '1.6',
      color: '#4b5563'
    },
    footerNote: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb',
      color: '#6b7280',
      fontSize: isMobile ? '0.8rem' : '0.9rem'
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
    { number: '100+', label: 'Student Users' },
    { number: '500+', label: 'Total Downloads' }
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
        <div style={styles.missionText}>
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
              <h3 style={{ marginBottom: '0.5rem', color: '#1f2937', fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                {feature.desc}
              </p>
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
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>👨‍💻 Created By</h2>
        <div style={styles.teamCard}>
          <div style={styles.avatar}>S</div>
          <h3 style={{ 
            marginBottom: '0.5rem', 
            color: '#1f2937',
            fontSize: isMobile ? '1.3rem' : '1.5rem'
          }}>
            Karan Suyal
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Full Stack Developer & Student
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
            BCA in Computer Science • Passionate about EdTech
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
              fontWeight: '500',
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              borderRadius: '20px'
            }}>
              📧 Email
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <h2 style={{ 
          marginBottom: '1rem', 
          color: '#1f2937',
          fontSize: isMobile ? '1.5rem' : '2rem'
        }}>
          Ready to join our learning community?
        </h2>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem', 
          maxWidth: '600px', 
          margin: '0 auto 1.5rem',
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}>
          Start uploading your notes, download study materials, and help other students succeed.
        </p>
        <div style={styles.ctaButtons}>
          <Link to="/upload" style={{
            ...styles.ctaButton,
            background: '#4f46e5'
          }}>
            📤 Upload Notes
          </Link>
          <Link to="/Home" style={{
            ...styles.ctaButton,
            background: '#10b981'
          }}>
            GitHub
          </Link>
          <Link to="https://github.com/karansuyal/Study-Portal" style={{
            ...styles.ctaButton,
            background: '#f59e0b'
          }}>
            👤 Join Now
            </Link>
          <Link to="/Login" style={{
            ...styles.ctaButton,
            background: '#10b981'
          }}>
          </Link>
        </div>
      </section>

      {/* Footer Note */}
      <div style={styles.footerNote}>
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