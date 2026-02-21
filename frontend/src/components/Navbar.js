import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, FaUpload, FaInfoCircle, FaHome, 
  FaGraduationCap, FaSignInAlt, FaUserPlus, FaBars, FaTimes,
  FaSignOutAlt, FaAngleDown
} from 'react-icons/fa';
import './Navbar.css'; // CSS import

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

  // Debounced search
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
        // Fallback courses
        setCourses([
          { id: 1, name: 'B.Tech', icon: '💻', code: 'BTECH', students: '4 Years' },
          { id: 2, name: 'BCA', icon: '📱', code: 'BCA', students: '3 Years' },
          { id: 3, name: 'BBA', icon: '📊', code: 'BBA', students: '3 Years' },
          { id: 4, name: 'MBA', icon: '🎓', code: 'MBA', students: '2 Years' },
          { id: 5, name: 'MCA', icon: '💼', code: 'MCA', students: '2 Years' },
        ]);
      }
    } catch (error) {
      setCourses([
        { id: 1, name: 'B.Tech', icon: '💻', code: 'BTECH', students: '4 Years' },
        { id: 2, name: 'BCA', icon: '📱', code: 'BCA', students: '3 Years' },
        { id: 3, name: 'BBA', icon: '📊', code: 'BBA', students: '3 Years' },
        { id: 4, name: 'MBA', icon: '🎓', code: 'MBA', students: '2 Years' },
        { id: 5, name: 'MCA', icon: '💼', code: 'MCA', students: '2 Years' },
      ]);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    
    const allCourses = [
      { id: 1, name: 'B.Tech Computer Science', icon: '💻', category: 'Engineering' },
      { id: 2, name: 'BCA', icon: '📱', category: 'Computer Applications' },
      { id: 3, name: 'MCA', icon: '💼', category: 'Computer Applications' },
      { id: 4, name: 'BBA', icon: '📊', category: 'Management' },
      { id: 5, name: 'MBA', icon: '🎓', category: 'Management' },
    ];

    const query = searchQuery.toLowerCase().trim();
    const filtered = allCourses.filter(course => 
      course.name.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query)
    );

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
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  <div className={`dropdown-content ${activeDropdown === 'courses' ? 'show' : ''}`}>
                    <div className="dropdown-grid">
                      {courses.map(course => (
                        <Link
                          key={course.id}
                          to={`/course/${course.id}`}
                          className="dropdown-item"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="course-icon">{course.icon}</div>
                          <div>
                            <div className="course-name">{course.name}</div>
                            <div className="course-desc">{course.students}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <Link to="/courses" className="view-all-courses" onClick={() => setActiveDropdown(null)}>
                        View All Courses →
                      </Link>
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

          {/* Search Bar */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
            />
          </div>

          {/* Auth Buttons */}
          <div className="auth-section">
            {isLoggedIn ? (
              <>
                <span style={{ color: 'white', marginRight: '0.5rem' }}>Hi, {user?.name || 'User'}</span>
                <button onClick={handleLogout} className="auth-btn login-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </>
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
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Mobile Auth */}
          <div className="mobile-auth">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="mobile-auth-btn login">
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

// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { 
//   FaSearch, FaUpload, FaInfoCircle, FaHome, 
//   FaGraduationCap, FaSignInAlt, FaUserPlus, FaBars, FaTimes,
//   FaSignOutAlt, FaAngleDown
// } from 'react-icons/fa';

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Check login status
//   useEffect(() => {
//     checkLoginStatus();
//     window.addEventListener('storage', checkLoginStatus);
//     window.addEventListener('loginStateChanged', checkLoginStatus);
//     return () => {
//       window.removeEventListener('storage', checkLoginStatus);
//       window.removeEventListener('loginStateChanged', checkLoginStatus);
//     };
//   }, []);

//   const checkLoginStatus = () => {
//     const token = localStorage.getItem('study_portal_token');
//     const userData = localStorage.getItem('study_portal_user');
    
//     if (token && userData) {
//       try {
//         setUser(JSON.parse(userData));
//         setIsLoggedIn(true);
//       } catch (e) {
//         setIsLoggedIn(false);
//         setUser(null);
//       }
//     } else {
//       setIsLoggedIn(false);
//       setUser(null);
//     }
//   };

//   // Scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Close menu on route change
//   useEffect(() => {
//     setIsMenuOpen(false);
//     setActiveDropdown(null);
//     setShowSearchResults(false);
//   }, [location]);

//   // Fetch courses
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery.length > 1) {
//         performSearch();
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   const fetchCourses = async () => {
//     try {
//       const response = await fetch('https://study-portal-ill8.onrender.com/api/courses');
//       const data = await response.json();
//       if (data.success) {
//         setCourses(data.courses.slice(0, 6));
//       }
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//     }
//   };

//   // ✅ FIXED: Search function - ab B.Tech bhi search hoga
//   const performSearch = async () => {
//     setLoading(true);
    
//     // Saare available courses with proper B.Tech names
//     const allCourses = [
//       // B.Tech Courses - Multiple variations
//       { id: 1, name: 'B.Tech Computer Science', searchName: 'btech computer science', icon: '💻', category: 'Engineering' },
    
//         // Computer Applications
//       { id: 2, name: 'BCA', searchName: 'bca', icon: '📱', category: 'Computer Applications' },
//       { id: 3, name: 'MCA', searchName: 'mca', icon: '💼', category: 'Computer Applications' },
      
//       // Management
//       { id: 4, name: 'BBA', searchName: 'bba', icon: '📊', category: 'Management' },
//       { id: 5, name: 'MBA', searchName: 'mba', icon: '🎓', category: 'Management' },
      
//     ];

//     // Filter courses based on search query (case insensitive)
//     const query = searchQuery.toLowerCase().trim();
//     const filtered = allCourses.filter(course => 
//       course.name.toLowerCase().includes(query) ||
//       course.searchName.includes(query) ||
//       course.category.toLowerCase().includes(query) ||
//       // Special case for B.Tech variations
//       (query === 'btech' && course.name.includes('B.Tech')) ||
//       (query === 'b.tech' && course.name.includes('B.Tech'))
//     );

//     setTimeout(() => {
//       setSearchResults(filtered);
//       setLoading(false);
//     }, 300);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
//       setShowSearchResults(false);
//       setSearchQuery('');
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('study_portal_token');
//     localStorage.removeItem('study_portal_user');
//     setIsLoggedIn(false);
//     setUser(null);
//     window.dispatchEvent(new Event('loginStateChanged'));
//     navigate('/');
//   };

//   // Nav items
//   const navItems = [
//     { name: 'Home', icon: <FaHome />, path: '/' },
//     { name: 'Courses', icon: <FaGraduationCap />, path: '/courses', hasDropdown: true },
//     { name: 'Upload', icon: <FaUpload />, path: '/upload' },
//     { name: 'About', icon: <FaInfoCircle />, path: '/about' },
//   ];

//   const styles = {
//     navbar: {
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       padding: '0.8rem 2rem',
//       position: 'sticky',
//       top: 0,
//       zIndex: 1000,
//       boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
//     },
//     container: {
//       maxWidth: '1400px',
//       margin: '0 auto',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       gap: '1rem'
//     },
//     logo: {
//       color: 'white',
//       fontSize: '1.5rem',
//       fontWeight: 'bold',
//       textDecoration: 'none',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//     },
//     searchContainer: {
//       position: 'relative',
//       flex: 1,
//       maxWidth: '400px',
//     },
//     searchForm: {
//       display: 'flex',
//       alignItems: 'center',
//       background: 'rgba(255, 255, 255, 0.2)',
//       borderRadius: '30px',
//       border: '1px solid rgba(255, 255, 255, 0.3)',
//       overflow: 'hidden',
//     },
//     searchInput: {
//       flex: 1,
//       padding: '0.7rem 1.2rem',
//       background: 'transparent',
//       border: 'none',
//       color: 'white',
//       fontSize: '0.9rem',
//       outline: 'none',
//       '&::placeholder': {
//         color: 'rgba(255, 255, 255, 0.8)',
//       }
//     },
//     searchButton: {
//       background: 'rgba(255, 255, 255, 0.3)',
//       border: 'none',
//       padding: '0.7rem 1.2rem',
//       color: 'white',
//       cursor: 'pointer',
//       display: 'flex',
//       alignItems: 'center',
//     },
//     searchResults: {
//       position: 'absolute',
//       top: '100%',
//       left: 0,
//       right: 0,
//       background: 'white',
//       borderRadius: '10px',
//       boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
//       marginTop: '0.5rem',
//       maxHeight: '350px',
//       overflowY: 'auto',
//       zIndex: 1000,
//     },
//     searchResultItem: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '1rem',
//       padding: '0.8rem 1rem',
//       borderBottom: '1px solid #e2e8f0',
//       cursor: 'pointer',
//       '&:hover': {
//         background: '#f7fafc',
//       }
//     },
//     navLinks: {
//       display: 'flex',
//       gap: '0.5rem',
//       alignItems: 'center',
//       marginRight: '1rem'
//     },
//     link: {
//       color: 'white',
//       textDecoration: 'none',
//       padding: '0.5rem 1rem',
//       borderRadius: '20px',
//       transition: 'all 0.3s',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.4rem',
//       fontSize: '0.95rem',
//       fontWeight: '500',
//       cursor: 'pointer',
//       background: 'transparent',
//       border: 'none',
//     },
//     activeLink: {
//       background: 'rgba(255, 255, 255, 0.2)',
//     },
//     dropdownWrapper: {
//       position: 'relative'
//     },
//     dropdownMenu: {
//       position: 'absolute',
//       top: '100%',
//       left: 0,
//       minWidth: '300px',
//       background: 'white',
//       borderRadius: '10px',
//       boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
//       padding: '0.5rem',
//       marginTop: '0.5rem',
//       zIndex: 1000,
//     },
//     dropdownItem: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.8rem',
//       padding: '0.8rem',
//       borderRadius: '8px',
//       cursor: 'pointer',
//       '&:hover': {
//         background: '#f0f0ff',
//       }
//     },
//     courseIcon: {
//       fontSize: '1.5rem',
//       width: '40px',
//       height: '40px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: '#667eea',
//       color: 'white',
//       borderRadius: '8px',
//     },
//     authButtons: {
//       display: 'flex',
//       gap: '0.5rem',
//     },
//     loginBtn: {
//       background: 'transparent',
//       border: '2px solid white',
//       color: 'white',
//       padding: '0.5rem 1.2rem',
//       borderRadius: '25px',
//       cursor: 'pointer',
//       fontWeight: '500',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.4rem',
//     },
//     registerBtn: {
//       background: 'white',
//       border: '2px solid white',
//       color: '#667eea',
//       padding: '0.5rem 1.2rem',
//       borderRadius: '25px',
//       cursor: 'pointer',
//       fontWeight: '600',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.4rem',
//     },
//     // ✅ Profile section completely removed
//     userInfo: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       color: 'white',
//       fontWeight: '500',
//     },
//     logoutBtn: {
//       background: 'transparent',
//       border: '2px solid white',
//       color: 'white',
//       padding: '0.5rem 1.2rem',
//       borderRadius: '25px',
//       cursor: 'pointer',
//       fontWeight: '500',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.4rem',
//     },
//     mobileBtn: {
//       display: 'none',
//       background: 'rgba(255, 255, 255, 0.2)',
//       border: '1px solid white',
//       color: 'white',
//       fontSize: '1.2rem',
//       cursor: 'pointer',
//       padding: '0.5rem',
//       borderRadius: '8px',
//     }
//   };

//   return (
//     <nav style={styles.navbar}>
//       <div style={styles.container}>
//         {/* Logo */}
//         <Link to="/" style={styles.logo}>
//           <span style={{ fontSize: '1.8rem' }}>📚</span>
//           <span>Study Portal</span>
//         </Link>

//         {/* Desktop Menu */}
//         <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
//           <div style={styles.navLinks}>
//             {navItems.map(item => (
//               item.hasDropdown ? (
//                 <div key={item.name} style={styles.dropdownWrapper}>
//                   <button
//                     style={{
//                       ...styles.link,
//                       ...(activeDropdown === 'courses' ? styles.activeLink : {})
//                     }}
//                     onClick={() => setActiveDropdown(activeDropdown === 'courses' ? null : 'courses')}
//                   >
//                     {item.icon} {item.name} <FaAngleDown style={{ fontSize: '0.8rem' }} />
//                   </button>

//                   {activeDropdown === 'courses' && (
//                     <div style={styles.dropdownMenu}>
//                       {courses.map(course => (
//                         <div
//                           key={course.id}
//                           style={styles.dropdownItem}
//                           onClick={() => {
//                             navigate(`/course/${course.id}`);
//                             setActiveDropdown(null);
//                           }}
//                         >
//                           <div style={styles.courseIcon}>{course.icon || '📚'}</div>
//                           <div>
//                             <div style={{ fontWeight: '600' }}>{course.name}</div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <Link
//                   key={item.name}
//                   to={item.path}
//                   style={{
//                     ...styles.link,
//                     ...(location.pathname === item.path ? styles.activeLink : {})
//                   }}
//                 >
//                   {item.icon} {item.name}
//                 </Link>
//               )
//             ))}
//           </div>

//           {/* Search Bar */}
//           <div style={styles.searchContainer}>
//             <form onSubmit={handleSearch} style={styles.searchForm}>
//               <input
//                 type="text"
//                 placeholder="Search courses (B.Tech, BCA, MBA...)"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setShowSearchResults(true);
//                 }}
//                 style={styles.searchInput}
//               />
//               <button type="submit" style={styles.searchButton}>
//                 <FaSearch />
//               </button>
//             </form>

//             {/* Search Results */}
//             {showSearchResults && searchQuery.length > 1 && (
//               <div style={styles.searchResults}>
//                 {loading ? (
//                   <div style={{ padding: '1rem', textAlign: 'center' }}>Searching...</div>
//                 ) : searchResults.length > 0 ? (
//                   searchResults.map((result, index) => (
//                     <div
//                       key={index}
//                       style={styles.searchResultItem}
//                       onClick={() => {
//                         navigate(`/course/${result.id}`);
//                         setShowSearchResults(false);
//                         setSearchQuery('');
//                       }}
//                     >
//                       <span style={{ fontSize: '1.5rem' }}>{result.icon}</span>
//                       <div>
//                         <div style={{ fontWeight: '600' }}>{result.name}</div>
//                         <div style={{ fontSize: '0.8rem', color: '#666' }}>{result.category}</div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
//                     No courses found for "{searchQuery}"
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Auth Buttons - Profile section removed */}
//           {isLoggedIn ? (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <span style={styles.userInfo}>Hi, {user?.name || 'User'}</span>
//               <button onClick={handleLogout} style={styles.logoutBtn}>
//                 <FaSignOutAlt /> Logout
//               </button>
//             </div>
//           ) : (
//             <div style={styles.authButtons}>
//               <button style={styles.loginBtn} onClick={() => navigate('/login')}>
//                 <FaSignInAlt /> Login
//               </button>
//               <button style={styles.registerBtn} onClick={() => navigate('/register')}>
//                 <FaUserPlus /> Register
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Mobile Menu Button */}
//         <button style={styles.mobileBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
//           {isMenuOpen ? <FaTimes /> : <FaBars />}
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
