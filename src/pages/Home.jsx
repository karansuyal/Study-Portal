import React, {useState, useEffect} from "react";
import CourseCard from "../components/CourseCard";
import config, {getAllCourses} from "../config/config";
import {
  getRecentMaterials,
  getFeaturedCourses,
  getStats,
  checkHealth,
  addSampleCourses,
} from "../services/api";
import "./Home.css";
import {useNavigate} from "react-router-dom";
import {useNoteStats} from "../hooks/useNoteStats";

const API_URL = "https://study-portal-ill8.onrender.com/api";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [backendCourses, setBackendCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showBanner, setShowBanner] = useState(() => {
    const closedAt = localStorage.getItem("bannerClosedAt");
    if (!closedAt) return true;

    const closedTime = parseInt(closedAt);
    const now = Date.now();
    const sixtyMinutes = 60 * 60 * 1000;
    return now - closedTime > sixtyMinutes;
  });
  const handleCloseBanner = () => {
    setShowBanner(false);
    localStorage.setItem("bannerClosedAt", Date.now().toString());
  };
  const [stats, setStats] = useState([
    {title: "Total Notes", value: "Loading...", icon: "📄", key: "notes"},
    {title: "PYQs", value: "Loading...", icon: "📝", key: "pyqs"},
    {title: "Courses", value: "Loading...", icon: "🎓", key: "courses"},
    {title: "Downloads", value: "Loading...", icon: "⬇️", key: "downloads"},
  ]);

  const [showAddCoursesBtn, setShowAddCoursesBtn] = useState(false);
  const [latestMaterials, setLatestMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState("");

  const navigate = useNavigate();

  const staticCourses = getAllCourses();

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    checkBackend();
    fetchData();
    fetchLatestMaterials();
  }, []);

  const fetchLatestMaterials = async () => {
    try {
      setMaterialsLoading(true);
      setMaterialsError("");

      const response = await fetch(`${API_URL}/materials`);
      const data = await response.json();

      if (data.success) {
        const transformedMaterials = data.materials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type || m.material_type || m.note_type || "notes",
          course_name: m.course || m.course_name || "Unknown",
          user_name: m.user_name || "Unknown",
          uploaded_at: m.uploaded_at,
          views: m.views || 0,
          downloads: m.downloads || 0,
          material_type: m.material_type || m.note_type,
          file_name: m.file_name,
          cloudinary_url: m.cloudinary_url || null,
        }));

        const itemsToShow = isMobile ? 3 : isTablet ? 4 : 6;
        setLatestMaterials(transformedMaterials.slice(0, itemsToShow));
      } else {
        setMaterialsError(data.error || "Failed to fetch materials");
      }
    } catch (error) {
      console.error("Materials fetch error:", error);
      setMaterialsError("Connection failed. Please try again later.");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const MaterialCard = ({material}) => {
    const [downloading, setDownloading] = useState(false);
    const typeStyle = getMaterialTypeColor(material.type);

    // ✅ useNoteStats hook - UNIVERSAL COUNTERS
    const stats = useNoteStats(material.id, {
      views: material.views || 0,
      downloads: material.downloads || 0,
    });

    const handleDownload = async (e) => {
      e.stopPropagation();
      setDownloading(true);

      try {
        // ✅ Universal download increment
        stats.incrementDownload();

        if (material.cloudinary_url) {
          console.log(
            "📥 Downloading from Cloudinary:",
            material.cloudinary_url,
          );

          const response = await fetch(material.cloudinary_url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // Get filename from URL or use title
          let filename = material.file_name || material.title || "download.pdf";

          // Add extension if missing
          if (!filename.includes(".")) {
            const isPDF =
              material.cloudinary_url.includes(".pdf") ||
              material.type === "pdf" ||
              material.file_name?.endsWith(".pdf");
            filename += isPDF ? ".pdf" : ".jpg";
          }

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          // API download
          const token = localStorage.getItem("study_portal_token");

          if (!token) {
            const shouldLogin = window.confirm(
              "Please login first to download materials. Go to login page?",
            );
            if (shouldLogin) {
              navigate("/login");
            }
            return;
          }

          const response = await fetch(
            `${API_URL}/notes/${material.id}/download`,
            {
              headers: {Authorization: `Bearer ${token}`},
            },
          );

          if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
          }

          const blob = await response.blob();

          // Get filename from Content-Disposition or use default
          const contentDisposition = response.headers.get(
            "Content-Disposition",
          );
          let filename = material.file_name || `${material.title}.pdf`;

          if (contentDisposition) {
            const match = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
            );
            if (match && match[1]) {
              filename = match[1].replace(/['"]/g, "");
            }
          }

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.click();
        }
      } catch (error) {
        console.error("❌ Download error:", error);
        alert(`Download failed: ${error.message}`);
      } finally {
        setDownloading(false);
      }
    };

    return (
      <div className="material-card">
        <div className="material-header">
          <span
            className="material-type"
            style={{background: typeStyle.background, color: typeStyle.color}}
          >
            {typeStyle.label}
          </span>
          <span className="material-date">
            {formatDate(material.uploaded_at)}
          </span>
        </div>

        <h4 className="material-title">{material.title}</h4>

        <div className="material-info">
          <div className="info-item">
            <span className="info-icon">📚</span>
            <span className="info-text">{material.course_name}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">👤</span>
            <span className="info-text">{material.user_name}</span>
          </div>
        </div>

        <div className="material-stats">
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span className="stat-value">{stats.views}</span> {/* ✅ UPDATED */}
          </div>
          <div className="stat-item">
            <span className="stat-icon">⬇️</span>
            <span className="stat-value">{stats.downloads}</span>{" "}
            {/* ✅ UPDATED */}
          </div>
        </div>

        <button
          id={`download-${material.id}`}
          className="download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "⏳" : "⬇️ Download"}
        </button>

        {material.cloudinary_url && (
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              textAlign: "right",
              marginTop: "5px",
            }}
          >
            ☁️ Cloudinary
          </div>
        )}
      </div>
    );
  };

  const checkBackend = async () => {
    try {
      const health = await checkHealth();
      if (health.course_count === 0) {
        setShowAddCoursesBtn(true);
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
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
      alert("❌ Failed to add sample courses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
  try {
    const coursesToShow = isMobile ? 3 : isTablet ? 4 : 6;
    const coursesData = await getFeaturedCourses(coursesToShow);

    const transformedCourses = coursesData.courses.map((course) => ({
      id: course.id,
      name: course.name,
      branch: course.branch || "General",
      semester: course.semester || "All",
      code: course.code || "GEN",
      notes: course.notes || 0,
      pyqs: course.pyqs || 0,
      description: course.description || "Study materials",
      created_at: course.created_at,
    }));

    setBackendCourses(transformedCourses);

    // ✅ FIX: Only fetch stats if user is admin (to avoid 401)
    const token = localStorage.getItem('study_portal_token');
    const user = JSON.parse(localStorage.getItem('study_portal_user') || '{}');
    
    let statsData;
    try {
      statsData = await getStats();
    } catch (statsError) {
      console.warn('Stats fetch failed (might be non-admin):', statsError);
      // Use default stats if API fails
      statsData = null;
    }
    
    if (statsData && (user.role === 'admin' || token)) {
      setStats([
        {
          title: "Total Notes",
          value: `${statsData.totalNotes || config.STATS_DEFAULTS.totalNotes}+`,
          icon: "📄",
          key: "notes",
        },
        {
          title: "PYQs",
          value: `${statsData.totalPYQs || config.STATS_DEFAULTS.totalPYQs}+`,
          icon: "📝",
          key: "pyqs",
        },
        {
          title: "Courses",
          value: `${statsData.totalCourses || config.STATS_DEFAULTS.totalCourses}+`,
          icon: "🎓",
          key: "courses",
        },
        {
          title: "Downloads",
          value: `${statsData.totalDownloads || config.STATS_DEFAULTS.totalDownloads}+`,
          icon: "⬇️",
          key: "downloads",
        },
      ]);
    } else {
      // Use default stats for non-admin users
      setStats([
        {
          title: "Total Notes",
          value: `${config.STATS_DEFAULTS.totalNotes}+`,
          icon: "📄",
          key: "notes",
        },
        {
          title: "PYQs",
          value: `${config.STATS_DEFAULTS.totalPYQs}+`,
          icon: "📝",
          key: "pyqs",
        },
        {
          title: "Courses",
          value: `${config.STATS_DEFAULTS.totalCourses}+`,
          icon: "🎓",
          key: "courses",
        },
        {
          title: "Downloads",
          value: `${config.STATS_DEFAULTS.totalDownloads}+`,
          icon: "⬇️",
          key: "downloads",
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);

    setBackendCourses([]);

    setStats([
      {
        title: "Total Notes",
        value: `${config.STATS_DEFAULTS.totalNotes}+`,
        icon: "📄",
        key: "notes",
      },
      {
        title: "PYQs",
        value: `${config.STATS_DEFAULTS.totalPYQs}+`,
        icon: "📝",
        key: "pyqs",
      },
      {
        title: "Courses",
        value: `${config.STATS_DEFAULTS.totalCourses}+`,
        icon: "🎓",
        key: "courses",
      },
      {
        title: "Downloads",
        value: `${config.STATS_DEFAULTS.totalDownloads}+`,
        icon: "⬇️",
        key: "downloads",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const displayCourses =
    backendCourses.length > 0
      ? backendCourses
      : staticCourses
          .slice(0, isMobile ? 3 : isTablet ? 4 : 6)
          .map((course) => ({
            id: course.id,
            name: course.name,
            branch: course.branches?.[0] || "General",
            semester: "All",
            code: course.name.substring(0, 4).toUpperCase(),
            notes: config.STATS_DEFAULTS.totalNotes / 5,
            pyqs: config.STATS_DEFAULTS.totalPYQs / 5,
            description: course.description,
            icon: course.icon,
            color: course.color,
            duration: course.duration,
          }));

  const features = [
    {title: "Updated Content", desc: "Regularly updated materials", icon: "✅"},
    {title: "Easy Search", desc: "Find materials quickly", icon: "🔍"},
    {title: "Mobile Friendly", desc: "Access on any device", icon: "📱"},
    {title: "Free Forever", desc: "All resources free", icon: "🆓"},
  ];

  const getMaterialTypeColor = (type) => {
    const typeMap = {
      notes: {background: "#dbeafe", color: "#1d4ed8", label: "📄 NOTES"},
      pyq: {background: "#fef3c7", color: "#92400e", label: "📝 PYQ"},
      syllabus: {background: "#dcfce7", color: "#166534", label: "📋 SYLLABUS"},
      imp_questions: {
        background: "#f3e8ff",
        color: "#6b21a8",
        label: "❓ IMP Q",
      },
      lab: {background: "#ffe4e6", color: "#9d174d", label: "🔬 LAB"},
      assignment: {background: "#fff7ed", color: "#9a3412", label: "📝 ASSIGN"},
      project: {background: "#ecfccb", color: "#3f6212", label: "📁 PROJECT"},
    };

    const normalizedType = type?.toLowerCase() || "notes";
    return typeMap[normalizedType] || typeMap.notes;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      {showBanner && (
        <div className="upload-banner">
          <div className="banner-content">
            <span className="banner-icon">📚</span>
            <span className="banner-text">
              <strong>Welcome to Study Portal!</strong> Upload Notes, PYQs,
              Syllabus and Study Materials to help others!
            </span>
            <button className="banner-close" onClick={handleCloseBanner}>
              ✕
            </button>
          </div>
        </div>
      )}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="hero-gradient">{config.APP_NAME}</span>
          </h1>
          <p className="hero-subtitle">
            <strong>
              Your one-stop destination for notes, PYQs, syllabus and study
              materials{" "}
            </strong>
          </p>
          <div className="search-wrapper">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search courses, notes, PYQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          {showAddCoursesBtn && (
            <button
              className="add-courses-btn"
              onClick={handleAddSampleCourses}
              disabled={loading}
            >
              {loading ? "Adding..." : "➕ Add Sample Courses"}
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

      {/* Courses Section */}
      <section className="courses-section">
        <h2 className="section-title">Popular Courses</h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="error-container">
            <div className="error-icon">📭</div>
            <h3>No courses found</h3>
            <button
              className="error-retry-btn"
              onClick={handleAddSampleCourses}
              disabled={loading}
            >
              {loading ? "Adding..." : "➕ Add Sample Courses"}
            </button>
          </div>
        ) : (
          <>
            <div className="courses-grid">
              {displayCourses.map((course) => (
                <div
                  key={course.id}
                  className="course-card-wrapper"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CourseCard
                    course={{
                      ...course,
                      onCourseClick: () => handleCourseClick(course.id),
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Materials Section */}
      <section className="materials-section">
        <h2 className="section-title">Latest Study Materials</h2>

        {materialsLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading latest materials...</p>
          </div>
        ) : materialsError ? (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h3>Failed to load materials</h3>
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
              {latestMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>

            <div className="view-all">
              <button
                className="view-all-btn"
                onClick={() => navigate("/all-materials")}
              >
                View All Materials →
              </button>
            </div>
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
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
