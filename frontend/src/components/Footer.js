import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-col">
          <h3 className="footer-logo">📚 Study Portal</h3>
          <p className="footer-desc">
            Your one-stop destination for study materials, notes & PYQs.
          </p>
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Notes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">PYQs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1k+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3 className="footer-title">Quick Links</h3>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/courses" className="footer-link">Courses</Link>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/upload" className="footer-link">Upload</Link>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3 className="footer-title">Contact</h3>
          <p className="footer-contact">📧 studyportal02@gmail.com</p>
          <p className="footer-contact">📞 7017320554</p>
          <p className="footer-contact">📍 GEHU Uttarakhand</p>
          <div className="footer-social">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">t</a>
            <a href="#" className="social-link">i</a>
            <a href="#" className="social-link">in</a>
            <a href="#" className="social-link">yt</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Study Portal</span>
        <span>Made with ❤️</span>
      </div>
    </footer>
  );
};

export default Footer;