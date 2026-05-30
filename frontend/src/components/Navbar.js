import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaInfoCircle, FaHome, 
  FaGraduationCap, FaSignInAlt, FaUserPlus, FaBars, FaTimes,
  FaSignOutAlt, FaAngleDown, FaUserCircle, FaMoon, FaSun
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sp_dark_mode') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode apply on mount + toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('sp_dark_mode', darkMode);
  }, [darkMode]);

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setMobileDropdown(null);
    setShowSearchResults(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown-wrapper') && !e.target.closest('.search-container')) {
        setActiveDropdown(null);
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) performSearch();
      else setSearchResults([]);
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
        setFallbackCourses();
      }
    } catch (error) {
      setFallbackCourses();
    }
  };

  const setFallbackCourses = () => {
    setCourses([
      { id: 1, name: 'B.Tech', icon: '💻', code: 'BTECH', duration: '4 Years', students: '2.5k+' },
      { id: 2, name: 'BCA', icon: '📱', code: 'BCA', duration: '3 Years', students: '1.8k+' },
      { id: 3, name: 'BBA', icon: '📊', code: 'BBA', duration: '3 Years', students: '1.2k+' },
      { id: 4, name: 'MBA', icon: '🎓', code: 'MBA', duration: '2 Years', students: '900+' },
      { id: 5, name: 'MCA', icon: '💼', code: 'MCA', duration: '2 Years', students: '750+' },
    ]);
  };

  const performSearch = () => {
    setLoading(true);
    const allCourses = [
      { id: 1, name: 'B.Tech', fullName: 'Bachelor of Technology', icon: '💻', category: 'Engineering' },
      { id: 2, name: 'BCA', fullName: 'Bachelor of Computer Applications', icon: '📱', category: 'Computer Applications' },
      { id: 3, name: 'BBA', fullName: 'Bachelor of Business Administration', icon: '📊', category: 'Management' },
      { id: 4, name: 'MBA', fullName: 'Master of Business Administration', icon: '🎓', category: 'Management' },
      { id: 5, name: 'MCA', fullName: 'Master of Computer Applications', icon: '💼', category: 'Computer Applications' },
    ];
    const query = searchQuery.toLowerCase().trim();
    const filtered = allCourses.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.fullName.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
    setTimeout(() => {
      setSearchResults(filtered);
      setLoading(false);
    }, 200);
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

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${darkMode ? 'dark' : ''}`}>
      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon-wrap">
            <img
              src="/logo.png"
              alt="Study Portal"
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-fallback-icon" style={{ display: 'none' }}>📚</div>
          </div>
          <div className="logo-text">
            <span className="logo-title">Study Portal</span>
            <span className="logo-sub">by Karan Suyal</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">

          {/* Nav Links */}
          <div className="nav-links">
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
                      <FaAngleDown className={`drop-arrow ${activeDropdown === 'courses' ? 'open' : ''}`} />
                    </button>

                    <div className={`dropdown-panel ${activeDropdown === 'courses' ? 'show' : ''}`}>
                      <div className="dp-header">
                        <span>Popular Courses</span>
                        <Link to="/courses" className="dp-view-all" onClick={() => setActiveDropdown(null)}>
                          View All →
                        </Link>
                      </div>
                      <div className="dp-grid">
                        {courses.map(course => (
                          <Link
                            key={course.id}
                            to={`/course/${course.id}`}
                            className="dp-item"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="dp-item-icon">{course.icon}</div>
                            <div className="dp-item-info">
                              <span className="dp-item-name">{course.name}</span>
                              <span className="dp-item-meta">{course.duration} · {course.students} students</span>
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
          </div>

          {/* Search */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <FaSearch className="s-icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button type="button" className="s-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <FaTimes />
                </button>
              )}
            </form>

            {showSearchResults && searchQuery.length > 1 && (
              <div className="search-dropdown">
                {loading ? (
                  <div className="s-loading"><div className="s-spinner" /><span>Searching...</span></div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="s-results-label">Courses</div>
                    {searchResults.map(r => (
                      <div
                        key={r.id}
                        className="s-result-item"
                        onClick={() => {
                          navigate(`/course/${r.id}`);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="s-result-icon">{r.icon}</span>
                        <div>
                          <div className="s-result-name">{r.name}</div>
                          <div className="s-result-full">{r.fullName}</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="s-no-results">
                    <span>No results for "{searchQuery}"</span>
                    <span className="s-hint">Try: BCA, BBA, B.Tech, MBA, MCA</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            className="dark-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Auth */}
          <div className="auth-area">
            {isLoggedIn ? (
              <div className="user-menu">
                <div className="user-avatar">{getUserInitials(user?.name)}</div>
                <span className="user-name">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <button className="btn-login" onClick={() => navigate('/login')}>
                  <FaSignInAlt /> Login
                </button>
                <button className="btn-register" onClick={() => navigate('/register')}>
                  <FaUserPlus /> Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-right">
          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-inner">

          {/* Mobile User / Auth */}
          {isLoggedIn ? (
            <div className="mobile-user-card">
              <div className="mobile-avatar">{getUserInitials(user?.name)}</div>
              <div>
                <div className="mobile-user-name">{user?.name || 'User'}</div>
                <div className="mobile-user-email">{user?.email || ''}</div>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-row">
              <button className="mob-btn-login" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                <FaSignInAlt /> Login
              </button>
              <button className="mob-btn-register" onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>
                <FaUserPlus /> Register
              </button>
            </div>
          )}

          <div className="mobile-divider" />

          {/* Mobile Search */}
          <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="mobile-search-form">
            <FaSearch />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-divider" />

          {/* Mobile Links */}
          {navItems.map(item => (
            <div key={item.name}>
              {item.hasDropdown ? (
                <>
                  <div
                    className="mob-nav-link"
                    onClick={() => setMobileDropdown(mobileDropdown === item.name ? null : item.name)}
                  >
                    <span className="mob-icon">{item.icon}</span>
                    <span>{item.name}</span>
                    <FaAngleDown className={`mob-arrow ${mobileDropdown === item.name ? 'open' : ''}`} />
                  </div>
                  <div className={`mob-sub ${mobileDropdown === item.name ? 'open' : ''}`}>
                    {courses.map(c => (
                      <Link
                        key={c.id}
                        to={`/course/${c.id}`}
                        className="mob-sub-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{c.icon}</span>
                        <span>{c.name}</span>
                        <span className="mob-sub-meta">{c.duration}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`mob-nav-link ${location.pathname === item.path ? 'mob-active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mob-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}

          {isLoggedIn && (
            <>
              <div className="mobile-divider" />
              <button className="mob-logout" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="mob-overlay" onClick={() => setIsMenuOpen(false)} />}
    </nav>
  );
};

export default Navbar;