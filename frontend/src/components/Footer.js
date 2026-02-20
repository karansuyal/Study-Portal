import React from 'react';
import './Footer.css'; // ✅ CSS file use karo

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Column 1 - About */}
        <div className="footer-col">
          <h3>📚 Study Portal</h3>
          <p>Notes, PYQs & study materials for all courses.</p>
          <div className="footer-stats">
            <span>1000+ Notes</span>
            <span>500+ PYQs</span>
            <span>50+ Courses</span>
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="/about">About</a>
          <a href="/upload">Upload</a>
        </div>

        {/* Column 3 - Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <p>📧 studyportal02@gmail.com</p>
          <p>📞 7017320554</p>
          <p>📍 GEHU Uttarakhand</p>
          <div className="footer-social">
            <a href="#">FB</a>
            <a href="#">IG</a>
            <a href="#">YT</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Study Portal. Made with ❤️
      </div>
    </footer>
  );
};

export default Footer;