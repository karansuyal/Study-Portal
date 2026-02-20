import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowRight, FaGraduationCap, FaBook, FaHistory, FaGlobe, FaUsers
} from 'react-icons/fa';
import './Footer.css'; // ✅ CSS import

const Footer = () => {
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
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1 - About with Stats */}
        <div className="about-section">
          <div className="footer-logo">
            <FaGraduationCap />
            <span>Study Portal</span>
          </div>
          <p className="footer-description">
            Your one-stop destination for quality study materials, notes, and resources for all courses.
          </p>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div className="links-section">
          <h3 className="section-title">Quick Links</h3>
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path} className="footer-link">
              <FaArrowRight className="link-icon" />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Column 3 - Contact */}
        <div className="contact-section">
          <h3 className="section-title">Get in Touch</h3>
          
          <div className="contact-item">
            <div className="contact-icon"><FaEnvelope /></div>
            <span>studyportal02@gmail.com</span>
          </div>

          <div className="contact-item">
            <div className="contact-icon"><FaPhone /></div>
            <span>7017320554</span>
          </div>

          <div className="contact-item">
            <div className="contact-icon"><FaMapMarkerAlt /></div>
            <span>GEHU Uttarakhand, India</span>
          </div>

          <div className="social-links">
            <a href="#" className="social-icon"><FaFacebookF /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaLinkedinIn /></a>
            <a href="#" className="social-icon"><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <span>© 2026 Study Portal. All rights reserved.</span>
        <span>Made with ❤️ for education</span>
      </div>
    </footer>
  );
};

export default Footer;