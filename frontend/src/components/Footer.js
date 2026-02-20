import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowRight, FaGraduationCap, FaBook, FaHistory, FaGlobe, FaUsers
} from 'react-icons/fa';

const Footer = () => {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    footer: {
      background: '#0B1120',
      color: '#E5E7EB',
      padding: isMobile ? '3rem 1.2rem 1.5rem' : '4rem 2rem 1.5rem',
      marginTop: '4rem',
      borderTop: '1px solid #1F2937'
    },

    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1.5fr',
      gap: isMobile ? '2.5rem' : '3rem'
    },

    aboutSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem'
    },

    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.3rem',
      fontWeight: '600',
      color: 'white'
    },

    description: {
      color: '#9CA3AF',
      lineHeight: '1.6',
      fontSize: '0.9rem',
      maxWidth: isMobile ? '100%' : '300px'
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginTop: '1rem'
    },

    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem'
    },

    statIcon: {
      width: '36px',
      height: '36px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6'
    },

    statContent: {
      display: 'flex',
      flexDirection: 'column'
    },

    statNumber: {
      color: 'white',
      fontWeight: '600'
    },

    statLabel: {
      color: '#9CA3AF',
      fontSize: '0.8rem'
    },

    linksSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },

    sectionTitle: {
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    link: {
      color: '#9CA3AF',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      padding: '0.3rem 0'
    },

    contactSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem'
    },

    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#9CA3AF',
      fontSize: '0.9rem'
    },

    contactIcon: {
      width: '36px',
      height: '36px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6'
    },

    socialLinks: {
      display: 'flex',
      gap: '0.8rem',
      marginTop: '1rem'
    },

    socialIcon: {
      width: '36px',
      height: '36px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      fontSize: '1rem',
      cursor: 'pointer'
    },

    bottom: {
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '2rem',
      marginTop: '2rem',
      borderTop: '1px solid #1F2937',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '0',
      textAlign: isMobile ? 'center' : 'left',
      color: '#6B7280',
      fontSize: '0.85rem'
    }
  };

  const stats = [
    { icon: <FaBook />, number: '1000+', label: 'Notes' },
    { icon: <FaHistory />, number: '500+', label: 'PYQs' },
    { icon: <FaGlobe />, number: '50+', label: 'Courses' },
    { icon: <FaUsers />, number: '1k+', label: 'Students' }
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Courses', path: '/courses' },
    { name: 'About Us', path: '/about' },
    { name: 'Upload', path: '/upload' }
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>

        <div style={styles.aboutSection}>
          <div style={styles.logo}>
            <FaGraduationCap style={{ color: '#3B82F6' }} />
            <span>Study Portal</span>
          </div>

          <p style={styles.description}>
            Your one-stop destination for quality study materials, notes, and resources.
          </p>

          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statItem}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statContent}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.linksSection}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path} style={styles.link}>
              <FaArrowRight size={10} />
              {link.name}
            </Link>
          ))}
        </div>

        <div style={styles.contactSection}>
          <h3 style={styles.sectionTitle}>Get in Touch</h3>

          <div style={styles.contactItem}>
            <div style={styles.contactIcon}><FaEnvelope /></div>
            <span>studyportal02@gmail.com</span>
          </div>

          <div style={styles.contactItem}>
            <div style={styles.contactIcon}><FaPhone /></div>
            <span>7017320554</span>
          </div>

          <div style={styles.contactItem}>
            <div style={styles.contactIcon}><FaMapMarkerAlt /></div>
            <span>GEHU Uttarakhand, India</span>
          </div>

          <div style={styles.socialLinks}>
            <div style={styles.socialIcon}><FaFacebookF /></div>
            <div style={styles.socialIcon}><FaTwitter /></div>
            <div style={styles.socialIcon}><FaInstagram /></div>
            <div style={styles.socialIcon}><FaLinkedinIn /></div>
            <div style={styles.socialIcon}><FaYoutube /></div>
          </div>
        </div>

      </div>

      <div style={styles.bottom}>
        <span>© 2026 Study Portal. All rights reserved.</span>
        <span>Made with ❤️ for education</span>
      </div>
    </footer>
  );
};

export default Footer;