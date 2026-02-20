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
      padding: '4rem 1.5rem 1.5rem', // Responsive padding
      marginTop: '4rem',
      borderTop: '1px solid #1F2937'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', // Desktop: 3 columns
      gap: '2rem',
      '@media (maxWidth: 768px)': {
        gridTemplateColumns: '1fr', // Mobile: 1 column
        gap: '2.5rem'
      }
    },
    // Column 1 - About
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
      color: 'white',
      marginBottom: '0.5rem'
    },
    description: {
      color: '#9CA3AF',
      lineHeight: '1.6',
      fontSize: '0.95rem',
      maxWidth: '350px', // Thoda chhota kiya
      '@media (maxWidth: 768px)': {
        maxWidth: '100%'
      }
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
      width: '40px',
      height: '40px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6',
      fontSize: '1rem'
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
      gap: '1rem'
    },
    sectionTitle: {
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '0.5rem',
      '@media (maxWidth: 768px)': {
        fontSize: '1.2rem'
      }
    },
    link: {
      color: '#9CA3AF',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem',
      padding: '0.4rem 0',
      transition: 'color 0.2s',
      ':hover': {
        color: '#3B82F6'
      }
    },
    linkIcon: {
      fontSize: '0.7rem',
      color: '#4B5563'
    },
    // Column 3 - Contact
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
      fontSize: '0.95rem',
      wordBreak: 'break-word' // Email waghera break ho jaye
    },
    contactIcon: {
      width: '40px',
      height: '40px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3B82F6',
      fontSize: '1rem',
      flexShrink: 0 // Icon shrink na ho
    },
    socialLinks: {
      display: 'flex',
      gap: '0.8rem',
      marginTop: '1rem',
      flexWrap: 'wrap' // Mobile par wrap ho jayega
    },
    socialIcon: {
      width: '40px',
      height: '40px',
      background: '#1F2937',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      fontSize: '1rem',
      transition: 'all 0.2s',
      cursor: 'pointer',
      ':hover': {
        background: '#3B82F6',
        color: 'white'
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
      '@media (maxWidth: 480px)': {
        flexDirection: 'column', // Mobile par vertically stack
        gap: '0.5rem',
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
    { name: 'All Courses', path: '/courses' },
    { name: 'About Us', path: '/about' },
    { name: 'Upload', path: '/upload' }
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Column 1 - About with Stats */}
        <div style={styles.aboutSection}>
          <div style={styles.logo}>
            <FaGraduationCap style={{ color: '#3B82F6' }} />
            <span>Study Portal</span>
          </div>
          <p style={styles.description}>
            Your one-stop destination for quality study materials, notes, and resources for all courses.
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

        {/* Column 2 - Quick Links */}
        <div style={styles.linksSection}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path} style={styles.link}>
              <FaArrowRight style={styles.linkIcon} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Column 3 - Contact */}
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
            <a href="#" style={styles.socialIcon}><FaFacebookF /></a>
            <a href="#" style={styles.socialIcon}><FaTwitter /></a>
            <a href="#" style={styles.socialIcon}><FaInstagram /></a>
            <a href="#" style={styles.socialIcon}><FaLinkedinIn /></a>
            <a href="#" style={styles.socialIcon}><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottom}>
        <span>© 2026 Study Portal. All rights reserved.</span>
        <span>Made with ❤️ for education</span>
      </div>

      {/* Media Queries via Style Tag */}
      <style>
        {`
          @media (max-width: 768px) {
            footer > div:first-child {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
            
            .contact-section span {
              word-break: break-word;
            }
          }
          
          @media (max-width: 480px) {
            footer > div:last-child {
              flex-direction: column !important;
              text-align: center !important;
              gap: 0.5rem !important;
            }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;