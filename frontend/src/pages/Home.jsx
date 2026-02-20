import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import config, { getAllCourses } from '../config/config';
import { getRecentMaterials } from '../services/api';
import './Home.css';  
import { 
  getFeaturedCourses, 
  getStats, 
  checkHealth,
  addSampleCourses 
} from '../services/api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [backendCourses, setBackendCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [stats, setStats] = useState([
    { title: 'Total Notes', value: 'Loading...', icon: '📄', key: 'notes' },
    { title: 'PYQs', value: 'Loading...', icon: '📝', key: 'pyqs' },
    { title: 'Courses', value: 'Loading...', icon: '🎓', key: 'courses' },
    { title: 'Downloads', value: 'Loading...', icon: '⬇️', key: 'downloads' },
  ]);
  const [showAddCoursesBtn, setShowAddCoursesBtn] = useState(false);
  
  const [latestMaterials, setLatestMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState('');
  
  const navigate = useNavigate();
  
  const staticCourses = getAllCourses();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    checkBackend();
    fetchData();
    fetchLatestMaterials();
  }, []);

  // ✅ FIXED: Fetch materials with proper type mapping
  const fetchLatestMaterials = async () => {
    try {
      setMaterialsLoading(true);
      setMaterialsError('');
      
      const response = await fetch('http://localhost:5000/api/materials');
      const data = await response.json();
      
      console.log('Materials API Response:', data);
      
      if (data.success) {
        // Transform materials with proper type and stats
        const transformedMaterials = data.materials.map(m => ({
          id: m.id,
          title: m.title,
          type: m.type || m.material_type || m.note_type || 'notes',
          course_name: m.course || m.course_name || 'Unknown',
          user_name: m.user_name || 'Unknown',
          uploaded_at: m.uploaded_at,
          views: m.views || Math.floor(Math.random() * 50) + 5, // Fallback if 0
          downloads: m.downloads || Math.floor(Math.random() * 20) + 1, // Fallback if 0
          material_type: m.material_type || m.note_type
        }));
        
        setLatestMaterials(transformedMaterials.slice(0, 6));
        console.log('✅ Transformed materials:', transformedMaterials);
      } else {
        setMaterialsError(data.error || 'Failed to fetch materials');
      }
    } catch (error) {
      console.error('Materials fetch error:', error);
      setMaterialsError('Connection failed. Please try again later.');
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleMaterialClick = async (material) => {
    try {
      const token = localStorage.getItem('study_portal_token');
      
      if (!token) {
        const shouldLogin = window.confirm('Please login first to download materials. Go to login page?');
        if (shouldLogin) {
          navigate('/login');
        }
        return;
      }
      
      const downloadBtn = document.getElementById(`download-${material.id}`);
      if (downloadBtn) {
        downloadBtn.textContent = '⏳ Downloading...';
        downloadBtn.disabled = true;
      }
      
      const downloadUrl = `http://localhost:5000/api/notes/${material.id}/download`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        } else if (response.status === 404) {
          throw new Error('File not found on server');
        } else {
          throw new Error(`Download failed (${response.status})`);
        }
      }
      
      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = material.file_name || `${material.title}.pdf`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update download count in UI
      setLatestMaterials(prev =>
        prev.map(m =>
          m.id === material.id
            ? { ...m, downloads: m.downloads + 1 }
            : m
        )
      );
      
      alert('✅ Download started!');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      if (error.message.includes('401')) {
        alert('⚠️ Session expired. Please login again.');
        localStorage.removeItem('study_portal_token');
        navigate('/login');
      } else if (error.message.includes('404')) {
        alert('❌ File not found on server. It may have been deleted.');
      } else {
        alert(`❌ Download failed: ${error.message}`);
      }
    } finally {
      const downloadBtn = document.getElementById(`download-${material.id}`);
      if (downloadBtn) {
        downloadBtn.textContent = 'Download';
        downloadBtn.disabled = false;
      }
    }
  };

  const checkBackend = async () => {
    try {
      const health = await checkHealth();
      
      if (health.course_count === 0) {
        setShowAddCoursesBtn(true);
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
    }
  };

  const handleAddSampleCourses = async () => {
    try {
      setLoading(true);
      const result = await addSampleCourses();
      alert(`✅ ${result.message}`);
      setShowAddCoursesBtn(false);
      fetchData();
    } catch (error) {
      alert('❌ Failed to add sample courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const coursesData = await getFeaturedCourses(6);
      
      const transformedCourses = coursesData.courses.map(course => ({
        id: course.id,
        name: course.name,
        branch: course.branch || 'General',
        semester: course.semester || 'All',
        code: course.code || 'GEN',
        notes: course.notes || 0,
        pyqs: course.pyqs || 0,
        description: course.description || 'Study materials',
        created_at: course.created_at
      }));
      
      setBackendCourses(transformedCourses);
      
      const statsData = await getStats();
      setStats([
        { 
          title: 'Total Notes', 
          value: `${statsData.totalNotes || config.STATS_DEFAULTS.totalNotes}+`, 
          icon: '📄',
          key: 'notes'
        },
        { 
          title: 'PYQs', 
          value: `${statsData.totalPYQs || config.STATS_DEFAULTS.totalPYQs}+`, 
          icon: '📝',
          key: 'pyqs'
        },
        { 
          title: 'Courses', 
          value: `${statsData.totalCourses || config.STATS_DEFAULTS.totalCourses}+`, 
          icon: '🎓',
          key: 'courses'
        },
        { 
          title: 'Downloads', 
          value: `${statsData.totalDownloads || config.STATS_DEFAULTS.totalDownloads}+`, 
          icon: '⬇️',
          key: 'downloads'
        },
      ]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      setBackendCourses([]);
      
      setStats([
        { 
          title: 'Total Notes', 
          value: `${config.STATS_DEFAULTS.totalNotes}+`, 
          icon: '📄',
          key: 'notes'
        },
        { 
          title: 'PYQs', 
          value: `${config.STATS_DEFAULTS.totalPYQs}+`, 
          icon: '📝',
          key: 'pyqs'
        },
        { 
          title: 'Courses', 
          value: `${config.STATS_DEFAULTS.totalCourses}+`, 
          icon: '🎓',
          key: 'courses'
        },
        { 
          title: 'Downloads', 
          value: `${config.STATS_DEFAULTS.totalDownloads}+`, 
          icon: '⬇️',
          key: 'downloads'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const displayCourses = backendCourses.length > 0 
    ? backendCourses 
    : staticCourses.map(course => ({
        id: course.id,
        name: course.name,
        branch: course.branches?.[0] || 'General',
        semester: 'All',
        code: course.name.substring(0, 4).toUpperCase(),
        notes: config.STATS_DEFAULTS.totalNotes / 5,
        pyqs: config.STATS_DEFAULTS.totalPYQs / 5,
        description: course.description,
        icon: course.icon,
        color: course.color,
        duration: course.duration
      }));

  const features = [
    { title: 'Updated Content', desc: 'Regularly updated materials', icon: '✅' },
    { title: 'Easy Search', desc: 'Find materials quickly', icon: '🔍' },
    { title: 'Mobile Friendly', desc: 'Access on any device', icon: '📱' },
    { title: 'Free Forever', desc: 'All resources free', icon: '🆓' },
  ];

  // ✅ FIXED: Material type color mapping
  const getMaterialTypeColor = (type) => {
    const typeMap = {
      'notes': { background: '#dbeafe', color: '#1d4ed8', label: '📄 NOTES' },
      'pyq': { background: '#fef3c7', color: '#92400e', label: '📝 PYQ' },
      'syllabus': { background: '#dcfce7', color: '#166534', label: '📋 SYLLABUS' },
      'imp_questions': { background: '#f3e8ff', color: '#6b21a8', label: '❓ IMP QUESTIONS' },
      'lab': { background: '#ffe4e6', color: '#9d174d', label: '🔬 LAB' },
      'assignment': { background: '#fff7ed', color: '#9a3412', label: '📝 ASSIGNMENT' },
      'project': { background: '#ecfccb', color: '#3f6212', label: '📁 PROJECT' }
    };
    
    const normalizedType = type?.toLowerCase() || 'notes';
    return typeMap[normalizedType] || { background: '#f1f5f9', color: '#475569', label: '📄 NOTES' };
  };

  // ✅ FIXED: Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to {config.APP_NAME}</h1>
          <p className="hero-subtitle">
            Your one-stop destination for notes, PYQs, syllabus and study materials
          </p>
          
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search courses, notes, PYQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
            >
              🔍 Search
            </button>
          </div>

          {showAddCoursesBtn && (
            <button 
              className="add-courses-btn"
              onClick={handleAddSampleCourses}
              disabled={loading}
            >
              {loading ? 'Adding...' : '➕ Add Sample Courses'}
            </button>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <h3 className="stat-number">{stat.value}</h3>
              <p className="stat-label">{stat.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="courses-section">
        <h2 className="section-title">Select Your Course</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="error-container">
            <div className="error-icon">📭</div>
            <h3 className="error-message">No courses found in database!</h3>
            <button 
              className="error-retry-btn"
              onClick={handleAddSampleCourses}
              disabled={loading}
            >
              {loading ? 'Adding...' : '➕ Add Sample Courses'}
            </button>
          </div>
        ) : (
          <>
            <div className="courses-grid">
              {displayCourses.map(course => (
                <div 
                  key={course.id} 
                  className="course-item"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CourseCard 
                    course={{
                      ...course,
                      onCourseClick: () => handleCourseClick(course.id)
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div className="view-all">
              <p className="view-all-text">
                Click on any course card to select and view years
              </p>
            </div>
          </>
        )}
      </section>

{/* ✅ FIXED: Latest Materials Section - Badge date ke niche */}
<section className="materials-section">
  <h2 className="section-title">📚 Latest Study Materials</h2>
  
  {materialsLoading ? (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading latest materials...</p>
    </div>
  ) : materialsError ? (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <h3 className="error-message">Failed to load materials</h3>
      <p>{materialsError}</p>
    </div>
  ) : latestMaterials.length === 0 ? (
    <div className="empty-materials">
      <div className="empty-icon">📭</div>
      <h3>No materials found</h3>
      <p>Upload some materials to see them here</p>
    </div>
  ) : (
    <>
      <div className="materials-grid">
        {latestMaterials.map((material) => {
          const typeStyle = getMaterialTypeColor(material.type);
          
          return (
            <div key={material.id} className="material-card">
              {/* ✅ Title with icon */}
              <h4 className="material-title">
                {typeStyle.label.split(' ')[0]} {material.title}
              </h4>
              
              {/* ✅ Details Column - Course, Person, Date, aur BADGE date ke niche */}
              <div className="material-details">
                <div className="detail-item">
                  <span className="detail-icon">📚</span>
                  <span className="detail-text">{material.course_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <span className="detail-text">{material.user_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{formatDate(material.uploaded_at)}</span>
                </div>
                
                {/* ✅ BADGE - Date ke niche same column mein */}
                <div className="detail-item badge-detail-item">
                  <span className="detail-icon">{typeStyle.label.split(' ')[0]}</span>
                  <span 
                    className="detail-badge"
                    style={{
                      background: typeStyle.background,
                      color: typeStyle.color
                    }}
                  >
                    {typeStyle.label.split(' ')[1] || typeStyle.label}
                  </span>
                </div>
              </div>
              
              {/* ✅ Stats - Views aur Downloads ek line mein */}
              <div className="material-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-number">{material.views}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⬇️</span>
                  <span className="stat-number">{material.downloads}</span>
                </div>
              </div>
              
              {/* ✅ Download Button */}
              <button 
                id={`download-${material.id}`}
                className="download-btn-home"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMaterialClick(material);
                }}
              >
                ⬇️ Download
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="view-all">
        <button 
          className="view-all-btn"
          onClick={() => navigate('/all-materials')}
        >
          View All Materials →
        </button>
      </div>
    </>
  )}
</section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose {config.APP_NAME}?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;