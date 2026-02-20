import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowRight, FaGraduationCap, FaBook, FaHistory, FaGlobe, FaUsers
} from 'react-icons/fa';

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

        {/* About */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 600 }}>
            <FaGraduationCap style={{ color: '#3B82F6' }} />
            Study Portal
          </div>

          <p style={{ color: '#9CA3AF', marginTop: '10px', fontSize: '14px' }}>
            Your one-stop destination for quality study materials and notes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginTop: '15px' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, background: '#1F2937',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', borderRadius: 8,
                  color: '#3B82F6'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{stat.number}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ color: 'white', fontSize: '16px' }}>Quick Links</h3>
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.path} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#9CA3AF',
              textDecoration: 'none',
              marginTop: '8px',
              fontSize: '14px'
            }}>
              <FaArrowRight size={10} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ color: 'white', fontSize: '16px' }}>Get in Touch</h3>

          <div style={{ marginTop: '10px', color: '#9CA3AF', fontSize: '14px' }}>
            <FaEnvelope /> studyportal02@gmail.com
          </div>

          <div style={{ marginTop: '8px', color: '#9CA3AF', fontSize: '14px' }}>
            <FaPhone /> 7017320554
          </div>

          <div style={{ marginTop: '8px', color: '#9CA3AF', fontSize: '14px' }}>
            <FaMapMarkerAlt /> GEHU Uttarakhand, India
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <span>© 2026 Study Portal. All rights reserved.</span>
        <span>Made with ❤️ for education</span>
      </div>
    </footer>
  );
};

export default Footer;