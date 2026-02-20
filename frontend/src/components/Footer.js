import React from 'react';
import './Footer.css'; // Sirf CSS import

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">📚 Study Portal</h3>
          <p className="footer-text">Your one-stop destination for study materials</p>
          <div className="stats-mini">
            <span>1000+ Notes</span>
            <span>500+ PYQs</span>
            <span>50+ Courses</span>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <a href="/" className="footer-link">Home</a>
          <a href="/courses" className="footer-link">Courses</a>
          <a href="/about" className="footer-link">About</a>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <p className="footer-text">📧 studyportal02@gmail.com</p>
          <p className="footer-text">📞 7017320554</p>
          <div className="social-mini">
            <a href="#">FB</a>
            <a href="#">IG</a>
            <a href="#">YT</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 Study Portal. Made with ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;