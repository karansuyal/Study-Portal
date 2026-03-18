import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowRight, FaGraduationCap, FaBook, FaHistory, FaGlobe, FaUsers
} from 'react-icons/fa';

const Footer = () => {
  const styles = {
    footer: {
      background: '#0B1120',
      color: '#E5E7EB',
      padding: '4rem 2rem 1.5rem',
      marginTop: '4rem',
      borderTop: '1px solid #1F2937'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1.5fr',
      gap: '3rem',
      '@media (max-width: 968px)': {
        gridTemplateColumns: '1fr',
        gap: '2rem'
      },
      '@media (max-width: 480px)': {
        gap: '1.5rem'
      }
    },
    // Column 1 - About
    aboutSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      '@media (max-width: 480px)': {
        alignItems: 'center',
        textAlign: 'center'
      }
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.3rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '0.5rem',
      '@media (max-width: 480px)': {
        justifyContent: 'center'
      }
    },
    description: {
      color: '#9CA3AF',
      lineHeight: '1.6',
      fontSize: '0.9rem',
      maxWidth: '300px',
      '@media (max-width: 968px)': {
        maxWidth: '100%'
      },
      '@media (max-width: 480px)': {
        textAlign: 'center'
      }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginTop: '1rem',
      '@media (max-width: 480px)': {
        gap: '0.8rem',
        width: '100%'
      }
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        textAlign: 'center',
        gap: '0.3rem'
      }
    },
    statIcon: {
      width: '36px',
      height: '36px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6',
      fontSize: '1rem',
      flexShrink: 0
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column'
    },
    statNumber: {
      color: 'white',
      fontWeight: '600',
      fontSize: '1rem'
    },
    statLabel: {
      color: '#9CA3AF',
      fontSize: '0.8rem'
    },
    // Column 2 - Quick Links
    linksSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      '@media (max-width: 968px)': {
        alignItems: 'center',
        textAlign: 'center'
      }
    },
    sectionTitle: {
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '0.5rem',
      '@media (max-width: 968px)': {
        textAlign: 'center'
      }
    },
    link: {
      color: '#9CA3AF',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      padding: '0.3rem 0',
      transition: 'color 0.2s',
      cursor: 'pointer',
      '@media (max-width: 968px)': {
        justifyContent: 'center'
      },
      '&:hover': {
        color: '#3B82F6'
      }
    },
    linkIcon: {
      fontSize: '0.7rem',
      color: '#4B5563',
      '@media (max-width: 968px)': {
        display: 'none'
      }
    },
    // Column 3 - Contact
    contactSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      '@media (max-width: 968px)': {
        alignItems: 'center',
        textAlign: 'center'
      }
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#9CA3AF',
      fontSize: '0.9rem',
      '@media (max-width: 968px)': {
        flexDirection: 'column',
        textAlign: 'center',
        gap: '0.5rem'
      }
    },
    contactIcon: {
      width: '36px',
      height: '36px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6',
      fontSize: '1rem',
      flexShrink: 0
    },
    socialLinks: {
      display: 'flex',
      gap: '0.8rem',
      marginTop: '1rem',
      '@media (max-width: 968px)': {
        justifyContent: 'center'
      },
      '@media (max-width: 480px)': {
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
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
      transition: 'all 0.2s',
      cursor: 'pointer',
      textDecoration: 'none',
      '&:hover': {
        background: '#3B82F6',
        color: 'white'
      },
      '@media (max-width: 480px)': {
        width: '40px',
        height: '40px'
      }
    },
    // Bottom Bar
    bottom: {
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '2rem',
      marginTop: '2rem',
      borderTop: '1px solid #1F2937',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#6B7280',
      fontSize: '0.85rem',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }
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
    { name: 'About Us', path: '/about' },
    { name: 'Upload', path: '/upload' }
  ];

  // Convert pseudo-selectors to inline styles not possible, so using style object with media queries
  // Media queries are added as strings in the style object but need to be in a <style> tag
  const mediaStyles = `
    @media (max-width: 968px) {
      .footer-container {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .footer-linksSection, .footer-contactSection {
        align-items: center !important;
        text-align: center !important;
      }
      .footer-link {
        justify-content: center !important;
      }
      .footer-linkIcon {
        display: none !important;
      }
      .footer-contactItem {
        flex-direction: column !important;
        text-align: center !important;
        gap: 0.5rem !important;
      }
      .footer-socialLinks {
        justify-content: center !important;
      }
      .footer-description {
        max-width: 100% !important;
      }
    }
    @media (max-width: 768px) {
      .footer-bottom {
        flex-direction: column !important;
        gap: 1rem !important;
        text-align: center !important;
      }
    }
    @media (max-width: 480px) {
      .footer-aboutSection {
        align-items: center !important;
        text-align: center !important;
      }
      .footer-logo {
        justify-content: center !important;
      }
      .footer-description {
        text-align: center !important;
      }
      .footer-statsGrid {
        gap: 0.8rem !important;
        width: 100% !important;
      }
      .footer-statItem {
        flex-direction: column !important;
        text-align: center !important;
        gap: 0.3rem !important;
      }
      .footer-socialLinks {
        flex-wrap: wrap !important;
        justify-content: center !important;
      }
      .footer-socialIcon {
        width: 40px !important;
        height: 40px !important;
      }
    }
  `;

  return (
    <footer style={styles.footer}>
      <style>{mediaStyles}</style>
      <div className="footer-container" style={styles.container}>
        {/* Column 1 - About with Stats */}
        <div className="footer-aboutSection" style={styles.aboutSection}>
          <div className="footer-logo" style={styles.logo}>
            <FaGraduationCap style={{ color: '#3B82F6' }} />
            <span>Study Portal</span>
          </div>
          <p className="footer-description" style={styles.description}>
            Your one-stop destination for quality study materials, notes, and resources for all courses.
          </p>
          <div className="footer-statsGrid" style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className="footer-statItem" style={styles.statItem}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statContent}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div className="footer-linksSection" style={styles.linksSection}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          {quickLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.path} 
              className="footer-link" 
              style={styles.link}
            >
              <FaArrowRight className="footer-linkIcon" style={styles.linkIcon} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Column 3 - Contact */}
        <div className="footer-contactSection" style={styles.contactSection}>
          <h3 style={styles.sectionTitle}>Get in Touch</h3>
          
          <div className="footer-contactItem" style={styles.contactItem}>
            <div style={styles.contactIcon}><FaEnvelope /></div>
            <span>studyportal02@gmail.com</span>
          </div>

          <div className="footer-contactItem" style={styles.contactItem}>
            <div style={styles.contactIcon}><FaPhone /></div>
            <span>9368169061</span>
          </div>

          <div className="footer-contactItem" style={styles.contactItem}>
            <div style={styles.contactIcon}><FaMapMarkerAlt /></div>
            <span>GEHU Uttarakhand, India</span>
          </div>

          <div className="footer-socialLinks" style={styles.socialLinks}>
            <a href="#" className="footer-socialIcon" style={styles.socialIcon}><FaFacebookF /></a>
            <a href="#" className="footer-socialIcon" style={styles.socialIcon}><FaTwitter /></a>
            <a href="#" className="footer-socialIcon" style={styles.socialIcon}><FaInstagram /></a>
            <a href="#" className="footer-socialIcon" style={styles.socialIcon}><FaLinkedinIn /></a>
            <a href="#" className="footer-socialIcon" style={styles.socialIcon}><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom" style={styles.bottom}>
        <span>© 2026 Study Portal. All rights reserved.</span>
        <span>Made with ❤️ for education</span>
      </div>
    </footer>
  );
};

export default Footer;

