import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0B1120',
        color: '#E5E7EB',
        padding: '2rem 1rem 1rem',
        marginTop: '3rem',
        borderTop: '1px solid #1F2937'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        {/* Column 1 */}
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1rem' }}>
            📚 Study Portal
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Your one-stop destination for notes, PYQs & study materials.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            <span style={{ background: '#1F2937', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              1000+ Notes
            </span>
            <span style={{ background: '#1F2937', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              500+ PYQs
            </span>
            <span style={{ background: '#1F2937', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              50+ Courses
            </span>
          </div>
        </div>

        {/* Column 2 */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Quick Links</h4>
          <Link to="/" style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', padding: '0.2rem 0' }}>Home</Link>
          <Link to="/courses" style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', padding: '0.2rem 0' }}>Courses</Link>
          <Link to="/about" style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', padding: '0.2rem 0' }}>About</Link>
          <Link to="/upload" style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', padding: '0.2rem 0' }}>Upload</Link>
        </div>

        {/* Column 3 */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Contact</h4>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.3rem' }}>📧 studyportal02@gmail.com</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.3rem' }}>📞 7017320554</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>📍 GEHU Uttarakhand</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>FB</a>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>IG</a>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>YT</a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #1F2937', marginTop: '2rem', paddingTop: '1.5rem', color: '#6B7280', fontSize: '0.8rem' }}>
        © 2026 Study Portal. Made with ❤️
      </div>
    </footer>
  );
};

export default Footer;