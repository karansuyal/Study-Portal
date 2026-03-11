import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaInfoCircle, FaHome, 
  FaGraduationCap, FaSignInAlt, FaUserPlus, FaBars, FaTimes,
  FaSignOutAlt, FaAngleDown, FaUserCircle
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('loginStateChanged', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStateChanged', checkLoginStatus);
    };
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('study_portal_token');
    const userData = localStorage.getItem('study_portal_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setMobileDropdown(null);
    setShowSearchResults(false);
  }, [location]);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Debounced search - SIRF 5 COURSES
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://study-portal-ill8.onrender.com/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses.slice(0, 6));
      } else {
        // Fallback courses - SIRF 5 COURSES
        setCourses([
          { id: 1, name: 'B.Tech', icon: '💻', code: 'BTECH', duration: '4 Years', students: '2.5k+' },
          { id: 2, name: 'BCA', icon: '📱', code: 'BCA', duration: '3 Years', students: '1.8k+' },
          { id: 3, name: 'BBA', icon: '📊', code: 'BBA', duration: '3 Years', students: '1.2k+' },
          { id: 4, name: 'MBA', icon: '🎓', code: 'MBA', duration: '2 Years', students: '900+' },
          { id: 5, name: 'MCA', icon: '💼', code: 'MCA', duration: '2 Years', students: '750+' },
        ]);
      }
    } catch (error) {
      setCourses([
        { id: 1, name: 'B.Tech', icon: '💻', code: 'BTECH', duration: '4 Years', students: '2.5k+' },
        { id: 2, name: 'BCA', icon: '📱', code: 'BCA', duration: '3 Years', students: '1.8k+' },
        { id: 3, name: 'BBA', icon: '📊', code: 'BBA', duration: '3 Years', students: '1.2k+' },
        { id: 4, name: 'MBA', icon: '🎓', code: 'MBA', duration: '2 Years', students: '900+' },
        { id: 5, name: 'MCA', icon: '💼', code: 'MCA', duration: '2 Years', students: '750+' },
      ]);
    }
  };

  // ✅ FIXED: Proper search function - SIRF 5 COURSES
  const performSearch = () => {
    setLoading(true);
    
    // Sirf 5 courses
    const allCourses = [
      { id: 1, name: 'B.Tech', fullName: 'Bachelor of Technology', icon: '💻', category: 'Engineering' },
      { id: 2, name: 'BCA', fullName: 'Bachelor of Computer Applications', icon: '📱', category: 'Computer Applications' },
      { id: 3, name: 'BBA', fullName: 'Bachelor of Business Administration', icon: '📊', category: 'Management' },
      { id: 4, name: 'MBA', fullName: 'Master of Business Administration', icon: '🎓', category: 'Management' },
      { id: 5, name: 'MCA', fullName: 'Master of Computer Applications', icon: '💼', category: 'Computer Applications' },
    ];

    const query = searchQuery.toLowerCase().trim();
    
    // Improved search - name, fullName, category, and variations
    const filtered = allCourses.filter(course => {
      // Basic matches
      const nameMatch = course.name.toLowerCase().includes(query);
      const fullNameMatch = course.fullName.toLowerCase().includes(query);
      const categoryMatch = course.category.toLowerCase().includes(query);
      
      // B.Tech variations
      const btechMatch = (course.name === 'B.Tech') && (
        query === 'btech' || query === 'b.tech' || query === 'b tech' || 
        query === 'engineering' || query === 'bachelor of technology'
      );
      
      // BCA variations
      const bcaMatch = (course.name === 'BCA') && (
        query === 'bca' || query === 'computer applications' || query === 'bachelor of computer applications'
      );
      
      // BBA variations
      const bbaMatch = (course.name === 'BBA') && (
        query === 'bba' || query === 'business administration' || query === 'bachelor of business administration'
      );
      
      // MBA variations
      const mbaMatch = (course.name === 'MBA') && (
        query === 'mba' || query === 'master of business administration'
      );
      
      // MCA variations
      const mcaMatch = (course.name === 'MCA') && (
        query === 'mca' || query === 'master of computer applications'
      );
      
      return nameMatch || fullNameMatch || categoryMatch || 
             btechMatch || bcaMatch || bbaMatch || mbaMatch || mcaMatch;
    });

    setTimeout(() => {
      setSearchResults(filtered);
      setLoading(false);
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('study_portal_token');
    localStorage.removeItem('study_portal_user');
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('loginStateChanged'));
    navigate('/');
  };

  const navItems = [
    { name: 'Home', icon: <FaHome />, path: '/' },
    { name: 'Courses', icon: <FaGraduationCap />, path: '/courses', hasDropdown: true },
    { name: 'Upload', icon: <FaUpload />, path: '/upload' },
    { name: 'About', icon: <FaInfoCircle />, path: '/about' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">📚</div>
          <div className="logo-text">
            <span className="logo-title">Study Portal</span>
            <span className="logo-subtitle">BY KARAN</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {navItems.map(item => (
            <div key={item.name} className="nav-item">
              {item.hasDropdown ? (
                <div className="dropdown-wrapper">
                  <button
                    className={`nav-link ${activeDropdown === 'courses' ? 'active' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'courses' ? null : 'courses')}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.name}
                    <FaAngleDown className={`dropdown-arrow ${activeDropdown === 'courses' ? 'rotated' : ''}`} />
                  </button>

                  <div className={`dropdown-content ${activeDropdown === 'courses' ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <span className="dropdown-title">Popular Courses</span>
                    </div>
                    <div className="dropdown-grid">
                      {courses.map(course => (
                        <Link
                          key={course.id}
                          to={`/course/${course.id}`}
                          className="dropdown-item"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="course-icon">{course.icon}</div>
                          <div className="course-info">
                            <div className="course-name">{course.name}</div>
                            <div className="course-duration">{course.duration}</div>
                            <div className="course-students">{course.students} students</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          {/* Search Bar - Desktop */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
              />
              {searchQuery && (
                <button type="button" className="search-clear" onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.length > 1 && (
              <div className="search-results">
                {loading ? (
                  <div className="search-loading">
                    <div className="spinner-small"></div>
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      <span>Courses</span>
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="search-result-item"
                        onClick={() => {
                          navigate(`/course/${result.id}`);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="result-icon">{result.icon}</span>
                        <div className="result-info">
                          <span className="result-name">{result.name}</span>
                          <span className="result-fullname">{result.fullName}</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="search-no-results">
                    <span>No courses found for "{searchQuery}"</span>
                    <span className="search-suggestion">
                      Try: BCA, BBA, B.Tech, MBA, MCA
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="auth-section">
            {isLoggedIn ? (
              <div className="user-menu">
                <span className="user-greeting">
                  <FaUserCircle className="user-icon" />
                  Hi, {user?.name?.split(' ')[0] || 'User'}
                </span>
                <button onClick={handleLogout} className="auth-btn logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="auth-btn login-btn">
                  <FaSignInAlt /> Login
                </button>
                <button onClick={() => navigate('/register')} className="auth-btn register-btn">
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <h3>Menu</h3>
          <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="mobile-nav-links">
          {navItems.map(item => (
            <div key={item.name}>
              {item.hasDropdown ? (
                <>
                  <div
                    className="mobile-nav-link"
                    onClick={() => setMobileDropdown(mobileDropdown === item.name ? null : item.name)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.name}
                    <FaAngleDown style={{ 
                      marginLeft: 'auto',
                      transform: mobileDropdown === item.name ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s'
                    }} />
                  </div>
                  
                  <div className={`mobile-dropdown-content ${mobileDropdown === item.name ? 'show' : ''}`}>
                    {courses.map(course => (
                      <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        className="mobile-dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{course.icon}</span>
                        <span>{course.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile Search */}
          <div className="mobile-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Mobile Auth */}
          <div className="mobile-auth">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="mobile-auth-btn logout">
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="mobile-auth-btn login">
                  <FaSignInAlt /> Login
                </button>
                <button onClick={() => navigate('/register')} className="mobile-auth-btn register">
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;
