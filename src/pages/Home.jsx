import React, { useState, useEffect, useRef } from "react";
import CourseCard from "../components/CourseCard";
import config, { getAllCourses } from "../config/config";
import {
  getFeaturedCourses,
  getStats,
  checkHealth,
  addSampleCourses,
} from "../services/api";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useNoteStats } from "../hooks/useNoteStats";

const API_URL = "https://study-portal-ill8.onrender.com/api";

/* ── Animated counter hook ─────────────────────── */
const useCountUp = (target, duration = 1600) => {
  const [count, setCount] = useState(0);
  const numTarget = parseInt(String(target).replace(/\D/g, "")) || 0;
  useEffect(() => {
    if (!numTarget) return;
    let start = 0;
    const step = numTarget / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numTarget) { setCount(numTarget); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [numTarget, duration]);
  return count;
};

/* ── StatCard with animated number ─────────────── */
const StatCard = ({ stat }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const suffix = String(stat.value).replace(/[0-9]/g, "");
  const count = useCountUp(visible ? stat.value : 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="stat-card" ref={ref}>
      <div className="stat-icon-wrap">{stat.icon}</div>
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{stat.title}</div>
    </div>
  );
};

/* ── Material type config ─────────────────────── */
const TYPE_MAP = {
  notes:         { bg: "#eff6ff", color: "#1d4ed8", label: "Notes",      dot: "#3b82f6" },
  pyq:           { bg: "#fefce8", color: "#854d0e", label: "PYQ",        dot: "#eab308" },
  syllabus:      { bg: "#f0fdf4", color: "#166534", label: "Syllabus",   dot: "#22c55e" },
  imp_questions: { bg: "#faf5ff", color: "#6b21a8", label: "Imp Q",      dot: "#a855f7" },
  lab:           { bg: "#fff1f2", color: "#9f1239", label: "Lab",        dot: "#f43f5e" },
  assignment:    { bg: "#fff7ed", color: "#9a3412", label: "Assignment",  dot: "#f97316" },
  project:       { bg: "#f7fee7", color: "#3f6212", label: "Project",    dot: "#84cc16" },
};
const getTypeStyle = (type) => TYPE_MAP[type?.toLowerCase()] || TYPE_MAP.notes;

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
};

/* ── MaterialCard ─────────────────────────────── */
const MaterialCard = ({ material }) => {
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const ts = getTypeStyle(material.type);
  const stats = useNoteStats(material.id, { views: material.views || 0, downloads: material.downloads || 0 });

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      stats.incrementDownload();
      if (material.cloudinary_url) {
        const res = await fetch(material.cloudinary_url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        let fn = material.file_name || material.title || "download.pdf";
        if (!fn.includes(".")) fn += ".pdf";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fn;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      } else {
        const token = localStorage.getItem("study_portal_token");
        if (!token) {
          if (window.confirm("Login required to download. Go to login?")) navigate("/login");
          return;
        }
        const res = await fetch(`${API_URL}/notes/${material.id}/download`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        const blob = await res.blob();
        const cd = res.headers.get("Content-Disposition");
        let fn = material.file_name || `${material.title}.pdf`;
        if (cd) { const m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/); if (m?.[1]) fn = m[1].replace(/['"]/g, ""); }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fn; a.click(); URL.revokeObjectURL(url);
      }
    } catch (err) { alert(`Download failed: ${err.message}`); }
    finally { setDownloading(false); }
  };

  return (
    <div className="mat-card">
      <div className="mat-top">
        <span className="mat-badge" style={{ background: ts.bg, color: ts.color }}>
          <span className="mat-dot" style={{ background: ts.dot }} />
          {ts.label}
        </span>
        <span className="mat-date">{formatDate(material.uploaded_at)}</span>
      </div>
      <h4 className="mat-title">{material.title}</h4>
      <div className="mat-meta">
        <span className="mat-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          {material.course_name}
        </span>
        <span className="mat-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {material.user_name}
        </span>
      </div>
      <div className="mat-stats">
        <span className="mat-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {stats.views}
        </span>
        <span className="mat-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {stats.downloads}
        </span>
        {material.cloudinary_url && (
          <span className="mat-cloud" title="Stored on Cloudinary">☁</span>
        )}
      </div>
      <button className="mat-dl-btn" onClick={handleDownload} disabled={downloading}>
        {downloading ? (
          <><span className="btn-spinner" /> Downloading...</>
        ) : (
          <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</>
        )}
      </button>
    </div>
  );
};

/* ── Feature data ─────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
    ),
    title: "Always Updated",
    desc: "Fresh notes, PYQs and materials added regularly by students and faculty.",
    color: "#5b4cf5",
    bg: "rgba(91,76,245,0.08)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    ),
    title: "Smart Search",
    desc: "Instantly find notes, PYQs, syllabi across any course or semester.",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
    ),
    title: "Mobile Ready",
    desc: "Study on any device — phone, tablet, or laptop — with a fluid experience.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    title: "Free Forever",
    desc: "Zero paisa, zero ads. All resources are always completely free.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
];

/* ══════════════════════════════════════════════════
   MAIN HOME COMPONENT
══════════════════════════════════════════════════ */
const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [backendCourses, setBackendCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showBanner, setShowBanner] = useState(() => {
    const t = localStorage.getItem("bannerClosedAt");
    return !t || Date.now() - parseInt(t) > 3_600_000;
  });
  const [stats, setStats] = useState([
    { title: "Total Notes", value: "0+", icon: "📄", key: "notes" },
    { title: "PYQs", value: "0+", icon: "📝", key: "pyqs" },
    { title: "Courses", value: "0+", icon: "🎓", key: "courses" },
    { title: "Downloads", value: "0+", icon: "⬇️", key: "downloads" },
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
    const fn = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    checkBackend();
    fetchData();
    fetchLatestMaterials();
  }, []);

  const fetchLatestMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const res = await fetch(`${API_URL}/materials`);
      const data = await res.json();
      if (data.success) {
        const items = data.materials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type || m.material_type || m.note_type || "notes",
          course_name: m.course || m.course_name || "Unknown",
          user_name: m.user_name || "Unknown",
          uploaded_at: m.uploaded_at,
          views: m.views || 0,
          downloads: m.downloads || 0,
          file_name: m.file_name,
          cloudinary_url: m.cloudinary_url || null,
        }));
        setLatestMaterials(items.slice(0, isMobile ? 3 : isTablet ? 4 : 6));
      } else {
        setMaterialsError(data.error || "Failed to fetch materials");
      }
    } catch {
      setMaterialsError("Connection failed. Please try again later.");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const checkBackend = async () => {
    try {
      const h = await checkHealth();
      if (h.course_count === 0) setShowAddCoursesBtn(true);
    } catch {}
  };

  const handleAddSampleCourses = async () => {
    try {
      setLoading(true);
      const r = await addSampleCourses();
      alert(r.message);
      setShowAddCoursesBtn(false);
      fetchData();
    } catch { alert("Failed to add sample courses"); }
    finally { setLoading(false); }
  };

  const fetchData = async () => {
    try {
      const n = isMobile ? 3 : isTablet ? 4 : 6;
      const cd = await getFeaturedCourses(n);
      setBackendCourses(cd.courses.map((c) => ({
        id: c.id, name: c.name,
        branch: c.branch || "General", semester: c.semester || "All",
        code: c.code || "GEN", notes: c.notes || 0, pyqs: c.pyqs || 0,
        description: c.description || "Study materials", created_at: c.created_at,
      })));
      const sd = await getStats();
      setStats([
        { title: "Total Notes", value: `${sd.totalNotes || config.STATS_DEFAULTS.totalNotes}+`, icon: "📄" },
        { title: "PYQs", value: `${sd.totalPYQs || config.STATS_DEFAULTS.totalPYQs}+`, icon: "📝" },
        { title: "Courses", value: `${sd.totalCourses || config.STATS_DEFAULTS.totalCourses}+`, icon: "🎓" },
        { title: "Downloads", value: `${sd.totalDownloads || config.STATS_DEFAULTS.totalDownloads}+`, icon: "⬇️" },
      ]);
    } catch {
      setBackendCourses([]);
      setStats([
        { title: "Total Notes", value: `${config.STATS_DEFAULTS.totalNotes}+`, icon: "📄" },
        { title: "PYQs", value: `${config.STATS_DEFAULTS.totalPYQs}+`, icon: "📝" },
        { title: "Courses", value: `${config.STATS_DEFAULTS.totalCourses}+`, icon: "🎓" },
        { title: "Downloads", value: `${config.STATS_DEFAULTS.totalDownloads}+`, icon: "⬇️" },
      ]);
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const displayCourses = backendCourses.length > 0
    ? backendCourses
    : staticCourses.slice(0, isMobile ? 3 : isTablet ? 4 : 6).map((c) => ({
        id: c.id, name: c.name,
        branch: c.branches?.[0] || "General", semester: "All",
        code: c.name.substring(0, 4).toUpperCase(),
        notes: Math.floor(config.STATS_DEFAULTS.totalNotes / 5),
        pyqs: Math.floor(config.STATS_DEFAULTS.totalPYQs / 5),
        description: c.description, icon: c.icon, color: c.color, duration: c.duration,
      }));

  return (
    <div className="home">

      {/* ── Announcement Banner ── */}
      {showBanner && (
        <div className="announcement-bar">
          <span className="ann-emoji">📚</span>
          <span className="ann-text">
            <strong>Welcome!</strong> Help your peers — upload your notes, PYQs, and study materials.
          </span>
          <button className="ann-close" onClick={() => { setShowBanner(false); localStorage.setItem("bannerClosedAt", Date.now()); }}>✕</button>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />
        <div className="hero-inner">
          <div className="hero-pill">🎓 Free Study Materials for Everyone</div>
          <h1 className="hero-h1">
            Study Smarter,<br />
            <span className="hero-accent">Score Higher</span>
          </h1>
          <p className="hero-sub">
            Notes, PYQs, Syllabi & Lab Manuals — all in one place, completely free.
          </p>

          <div className="hero-search">
            <svg className="hs-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="hs-input"
              type="text"
              placeholder="Search courses, notes, PYQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="hs-btn" onClick={handleSearch}>Search</button>
          </div>

          <div className="hero-tags">
            {["B.Tech", "BCA", "BBA", "MBA", "MCA"].map((t) => (
              <button key={t} className="hero-tag" onClick={() => navigate(`/search?q=${t}`)}>{t}</button>
            ))}
          </div>

          {showAddCoursesBtn && (
            <button className="add-courses-btn" onClick={handleAddSampleCourses} disabled={loading}>
              {loading ? "Adding..." : "➕ Add Sample Courses"}
            </button>
          )}
        </div>

        {/* Floating cards decoration */}
        <div className="hero-deco">
          <div className="deco-card deco-1">📄 <span>Computer Science Notes</span></div>
          <div className="deco-card deco-2">📝 <span>PYQ / Syllabus </span></div>
          <div className="deco-card deco-3">🔬 <span>Imp Question / Lab Manual</span></div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => <StatCard key={i} stat={s} />)}
        </div>
      </section>

      {/* ── Courses ── */}
      <section className="section courses-section">
        <div className="section-head">
          <div>
            <p className="section-eyebrow">Browse by Program</p>
            <h2 className="section-title">Popular Courses</h2>
          </div>
          {/* <button className="section-link" onClick={() => navigate("/courses")}>
            View All Courses
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button> */}
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">📭</div>
            <h3>No courses found</h3>
            <button className="primary-btn" onClick={handleAddSampleCourses} disabled={loading}>
              {loading ? "Adding..." : "➕ Add Sample Courses"}
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {displayCourses.map((course) => (
              <div key={course.id} className="course-wrapper" onClick={() => navigate(`/course/${course.id}`)}>
                <CourseCard course={{ ...course, onCourseClick: () => navigate(`/course/${course.id}`) }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Latest Materials ── */}
      <section className="section materials-section">
        <div className="section-head">
          <div>
            <p className="section-eyebrow">Recently Added</p>
            <h2 className="section-title">Latest Study Materials</h2>
          </div>
          <button className="section-link" onClick={() => navigate("/all-materials")}>
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        {materialsLoading ? (
          <div className="skeleton-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : materialsError ? (
          <div className="empty-state">
            <div className="empty-emoji">⚠️</div>
            <h3>Couldn't load materials</h3>
            <p>{materialsError}</p>
            <button className="primary-btn" onClick={fetchLatestMaterials}>Try Again</button>
          </div>
        ) : latestMaterials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">📭</div>
            <h3>No materials yet</h3>
            <p>Be the first to upload study materials!</p>
            <button className="primary-btn" onClick={() => navigate("/upload")}>Upload Now</button>
          </div>
        ) : (
          <div className="materials-grid">
            {latestMaterials.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="section features-section">
        <div className="section-head centered">
          <p className="section-eyebrow">Why Study Portal?</p>
          <h2 className="section-title">Everything You Need to Ace Your Exams</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon-wrap" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Have notes? Help a fellow student.</h2>
          <p className="cta-sub">Upload your study materials and join a growing community of learners.</p>
          <div className="cta-btns">
            <button className="cta-btn-primary" onClick={() => navigate("/upload")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Materials
            </button>
            <button className="cta-btn-secondary" onClick={() => navigate("/courses")}>
              Browse Courses
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
