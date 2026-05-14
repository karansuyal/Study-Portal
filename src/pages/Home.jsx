import React, { useState, useEffect, useRef } from "react";
import CourseCard from "../components/CourseCard";
import config, { getAllCourses } from "../config/config";
import {
  getRecentMaterials,
  getFeaturedCourses,
  getStats,
  checkHealth,
  addSampleCourses,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { useNoteStats } from "../hooks/useNoteStats";

/* ─── Google Font injection ──────────────────────────────────── */
const kanit = document.createElement("link");
kanit.rel = "stylesheet";
kanit.href =
  "https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700;900&display=swap";
document.head.appendChild(kanit);

const API_URL = "https://study-portal-ill8.onrender.com/api";

/* ─── Shared style tokens ─────────────────────────────────────── */
const T = {
  font: "'Kanit', sans-serif",
  bg: "#0C0C0C",
  text: "#D7E2EA",
  muted: "rgba(215,226,234,0.45)",
  border: "rgba(215,226,234,0.15)",
  white: "#ffffff",
  gradientText: {
    background: "linear-gradient(180deg,#646973 0%,#BBCCD7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  pill: {
    background:
      "linear-gradient(123deg,#18011F 7%,#B600A8 37%,#7621B0 72%,#BE4C00 100%)",
    boxShadow:
      "0px 4px 4px rgba(181,1,167,0.25),4px 4px 12px #7721B1 inset",
    outline: "2px solid white",
    outlineOffset: "-3px",
    borderRadius: 9999,
    border: "none",
    color: "#fff",
    fontFamily: "'Kanit',sans-serif",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer",
  },
};

/* ─── FadeIn (CSS-only, no framer-motion dep assumed) ─────────── */
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { rootMargin: "60px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.7s ${delay}s cubic-bezier(.25,.1,.25,1), transform 0.7s ${delay}s cubic-bezier(.25,.1,.25,1)`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(30px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Magnet hover ────────────────────────────────────────────── */
function Magnet({ children, strength = 3 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    const move = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxD = Math.max(r.width, r.height) / 2 + 150;
      if (dist < maxD) { setActive(true); setPos({ x: dx / strength, y: dy / strength }); }
      else { setActive(false); setPos({ x: 0, y: 0 }); }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [strength]);
  return (
    <div ref={ref} style={{
      transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
      transition: active ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
      willChange: "transform",
    }}>
      {children}
    </div>
  );
}

/* ─── Scroll marquee rows ─────────────────────────────────────── */
const GIFS = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif",
];

function MarqueeSection() {
  const ref = useRef(null);
  const [offset, setOffset] = useState(200);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * 0.3);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const r1 = [...GIFS.slice(0, 11), ...GIFS.slice(0, 11), ...GIFS.slice(0, 11)];
  const r2 = [...GIFS.slice(11), ...GIFS.slice(11), ...GIFS.slice(11)];
  const row = { display: "flex", gap: 12, willChange: "transform" };
  const img = { width: 380, height: 240, borderRadius: 14, objectFit: "cover", flexShrink: 0 };
  return (
    <section ref={ref} style={{ background: T.bg, padding: "6rem 0 2rem", overflow: "hidden" }}>
      <div style={{ ...row, transform: `translateX(${offset - 200}px)`, marginBottom: 12 }}>
        {r1.map((s, i) => <img key={i} src={s} alt="" style={img} loading="lazy" />)}
      </div>
      <div style={{ ...row, transform: `translateX(${-(offset - 200)}px)` }}>
        {r2.map((s, i) => <img key={i} src={s} alt="" style={img} loading="lazy" />)}
      </div>
    </section>
  );
}

/* ─── Helpers (kept from original) ───────────────────────────── */
const getMaterialTypeColor = (type) => {
  const typeMap = {
    notes: { background: "#dbeafe", color: "#1d4ed8", label: "📄 NOTES" },
    pyq: { background: "#fef3c7", color: "#92400e", label: "📝 PYQ" },
    syllabus: { background: "#dcfce7", color: "#166534", label: "📋 SYLLABUS" },
    imp_questions: { background: "#f3e8ff", color: "#6b21a8", label: "❓ IMP Q" },
    lab: { background: "#ffe4e6", color: "#9d174d", label: "🔬 LAB" },
    assignment: { background: "#fff7ed", color: "#9a3412", label: "📝 ASSIGN" },
    project: { background: "#ecfccb", color: "#3f6212", label: "📁 PROJECT" },
  };
  return typeMap[(type || "notes").toLowerCase()] || typeMap.notes;
};

const formatDate = (d) => {
  if (!d) return "N/A";
  try { return new Date(d).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }); }
  catch { return "N/A"; }
};

/* ─── Material Card ───────────────────────────────────────────── */
const MaterialCard = ({ material, navigate }) => {
  const [downloading, setDownloading] = useState(false);
  const typeStyle = getMaterialTypeColor(material.type);
  const stats = useNoteStats(material.id, { views: material.views || 0, downloads: material.downloads || 0 });

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      stats.incrementDownload();
      if (material.cloudinary_url) {
        const resp = await fetch(material.cloudinary_url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        let fn = material.file_name || material.title || "download.pdf";
        if (!fn.includes(".")) fn += ".pdf";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const token = localStorage.getItem("study_portal_token");
        if (!token) {
          if (window.confirm("Please login first to download. Go to login?")) navigate("/login");
          return;
        }
        const resp = await fetch(`${API_URL}/notes/${material.id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const blob = await resp.blob();
        const cd = resp.headers.get("Content-Disposition");
        let fn = material.file_name || `${material.title}.pdf`;
        if (cd) { const m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/); if (m?.[1]) fn = m[1].replace(/['"]/g, ""); }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fn; a.click();
      }
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      background: "#111",
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "border-color 0.2s, transform 0.2s",
      fontFamily: T.font,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(215,226,234,0.4)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ background: typeStyle.background, color: typeStyle.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          {typeStyle.label}
        </span>
        <span style={{ color: T.muted, fontSize: 11 }}>{formatDate(material.uploaded_at)}</span>
      </div>

      <h4 style={{ color: T.text, fontWeight: 600, fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.3, margin: 0 }}>
        {material.title}
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>📚</span>
          <span style={{ color: T.muted, fontSize: 13 }}>{material.course_name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>👤</span>
          <span style={{ color: T.muted, fontSize: 13 }}>{material.user_name}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ color: T.muted, fontSize: 13 }}>👁️ {stats.views}</span>
        <span style={{ color: T.muted, fontSize: 13 }}>⬇️ {stats.downloads}</span>
      </div>

      <button
        id={`download-${material.id}`}
        onClick={handleDownload}
        disabled={downloading}
        style={{
          ...T.pill,
          padding: "10px 0",
          fontSize: 13,
          marginTop: "auto",
          opacity: downloading ? 0.7 : 1,
        }}
      >
        {downloading ? "⏳ Downloading…" : "⬇️ Download"}
      </button>

      {material.cloudinary_url && (
        <div style={{ fontSize: 10, color: T.muted, textAlign: "right" }}>☁️ Cloudinary</div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT — all original logic preserved, new UI
═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [backendCourses, setBackendCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showBanner, setShowBanner] = useState(() => {
    const c = localStorage.getItem("bannerClosedAt");
    return c ? Date.now() - parseInt(c) > 3600000 : true;
  });
  const handleCloseBanner = () => { setShowBanner(false); localStorage.setItem("bannerClosedAt", Date.now().toString()); };

  const [stats, setStats] = useState([
    { title: "Total Notes", value: "Loading…", icon: "📄", key: "notes" },
    { title: "PYQs", value: "Loading…", icon: "📝", key: "pyqs" },
    { title: "Courses", value: "Loading…", icon: "🎓", key: "courses" },
    { title: "Downloads", value: "Loading…", icon: "⬇️", key: "downloads" },
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
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => { checkBackend(); fetchData(); fetchLatestMaterials(); }, []);

  const fetchLatestMaterials = async () => {
    try {
      setMaterialsLoading(true); setMaterialsError("");
      const resp = await fetch(`${API_URL}/materials`);
      const data = await resp.json();
      if (data.success) {
        const t = data.materials.map((m) => ({
          id: m.id, title: m.title,
          type: m.type || m.material_type || m.note_type || "notes",
          course_name: m.course || m.course_name || "Unknown",
          user_name: m.user_name || "Unknown",
          uploaded_at: m.uploaded_at,
          views: m.views || 0, downloads: m.downloads || 0,
          material_type: m.material_type || m.note_type,
          file_name: m.file_name, cloudinary_url: m.cloudinary_url || null,
        }));
        setLatestMaterials(t.slice(0, isMobile ? 3 : isTablet ? 4 : 6));
      } else { setMaterialsError(data.error || "Failed to fetch materials"); }
    } catch { setMaterialsError("Connection failed. Please try again later."); }
    finally { setMaterialsLoading(false); }
  };

  const checkBackend = async () => {
    try { const h = await checkHealth(); if (h.course_count === 0) setShowAddCoursesBtn(true); }
    catch { console.error("Backend connection failed"); }
  };

  const handleAddSampleCourses = async () => {
    try {
      setLoading(true);
      const r = await addSampleCourses();
      alert(r.message); setShowAddCoursesBtn(false); fetchData();
    } catch { alert("Failed to add sample courses"); }
    finally { setLoading(false); }
  };

  const fetchData = async () => {
    try {
      const n = isMobile ? 3 : isTablet ? 4 : 6;
      const cd = await getFeaturedCourses(n);
      setBackendCourses(cd.courses.map((c) => ({
        id: c.id, name: c.name, branch: c.branch || "General",
        semester: c.semester || "All", code: c.code || "GEN",
        notes: c.notes || 0, pyqs: c.pyqs || 0,
        description: c.description || "Study materials", created_at: c.created_at,
      })));
      const sd = await getStats();
      setStats([
        { title: "Total Notes", value: `${sd.totalNotes || config.STATS_DEFAULTS.totalNotes}+`, icon: "📄", key: "notes" },
        { title: "PYQs", value: `${sd.totalPYQs || config.STATS_DEFAULTS.totalPYQs}+`, icon: "📝", key: "pyqs" },
        { title: "Courses", value: `${sd.totalCourses || config.STATS_DEFAULTS.totalCourses}+`, icon: "🎓", key: "courses" },
        { title: "Downloads", value: `${sd.totalDownloads || config.STATS_DEFAULTS.totalDownloads}+`, icon: "⬇️", key: "downloads" },
      ]);
    } catch {
      setBackendCourses([]);
      setStats([
        { title: "Total Notes", value: `${config.STATS_DEFAULTS.totalNotes}+`, icon: "📄", key: "notes" },
        { title: "PYQs", value: `${config.STATS_DEFAULTS.totalPYQs}+`, icon: "📝", key: "pyqs" },
        { title: "Courses", value: `${config.STATS_DEFAULTS.totalCourses}+`, icon: "🎓", key: "courses" },
        { title: "Downloads", value: `${config.STATS_DEFAULTS.totalDownloads}+`, icon: "⬇️", key: "downloads" },
      ]);
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(""); }
  };
  const handleCourseClick = (id) => navigate(`/course/${id}`);

  const displayCourses = backendCourses.length > 0
    ? backendCourses
    : staticCourses.slice(0, isMobile ? 3 : isTablet ? 4 : 6).map((c) => ({
        id: c.id, name: c.name, branch: c.branches?.[0] || "General",
        semester: "All", code: c.name.substring(0, 4).toUpperCase(),
        notes: config.STATS_DEFAULTS.totalNotes / 5,
        pyqs: config.STATS_DEFAULTS.totalPYQs / 5,
        description: c.description, icon: c.icon, color: c.color, duration: c.duration,
      }));

  const features = [
    { title: "Updated Content", desc: "Regularly updated materials", icon: "🔄" },
    { title: "Easy Search", desc: "Find materials quickly", icon: "🔍" },
    { title: "Mobile Friendly", desc: "Access on any device", icon: "📱" },
    { title: "Free Forever", desc: "All resources free", icon: "🆓" },
  ];

  /* ── Heading style helper ── */
  const bigHeading = (extra = {}) => ({
    fontFamily: T.font,
    fontWeight: 900,
    fontSize: "clamp(2.8rem,10vw,9rem)",
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    textAlign: "center",
    ...T.gradientText,
    ...extra,
  });

  const sectionLabel = {
    fontFamily: T.font,
    fontWeight: 900,
    fontSize: "clamp(2rem,7vw,6rem)",
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    textAlign: "center",
    ...T.gradientText,
    marginBottom: "clamp(2rem,5vw,4rem)",
  };

  return (
    <div style={{ background: T.bg, fontFamily: T.font, overflowX: "clip", color: T.text }}>

      {/* ── Banner ── */}
      {showBanner && (
        <div style={{
          background: "linear-gradient(90deg,#18011F,#7621B0,#B600A8)",
          padding: "14px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <span style={{ color: "#fff", fontWeight: 500, fontSize: "clamp(0.75rem,1.5vw,1rem)", letterSpacing: "0.03em" }}>
            📚 <strong>Welcome!</strong> Upload Notes, PYQs &amp; Syllabus to help fellow students.
          </span>
          <button onClick={handleCloseBanner} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", opacity: 0.7 }}>✕</button>
        </div>
      )}

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        {/* Navbar */}
        <FadeIn delay={0}>
          <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px clamp(20px,5vw,60px) 0" }}>
            {["Notes", "PYQs", "Syllabus", "Contact"].map((l) => (
              <a key={l} href="#" style={{ color: T.text, fontFamily: T.font, fontWeight: 500, fontSize: "clamp(0.75rem,1.3vw,1.3rem)", textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={e => e.target.style.opacity = "0.4"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >{l}</a>
            ))}
          </nav>
        </FadeIn>

        {/* Big heading */}
        <FadeIn delay={0.15}>
          <div style={{ overflow: "hidden", padding: "0 clamp(20px,5vw,60px)" }}>
            <h1 style={{
              ...T.gradientText,
              fontFamily: T.font, fontWeight: 900,
              fontSize: "clamp(3.5rem,16vw,16vw)",
              textTransform: "uppercase", letterSpacing: "-0.02em",
              lineHeight: 1, whiteSpace: "nowrap", width: "100%",
              marginTop: "clamp(4px,-1vw,-20px)",
            }}>
              Study Portal
            </h1>
          </div>
        </FadeIn>

        {/* Portrait */}
        <FadeIn delay={0.55}>
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 0, zIndex: 10, width: "clamp(200px,28vw,460px)" }}>
            <Magnet strength={3}>
              <img
                src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
                alt="3D mascot"
                style={{ width: "100%", display: "block" }}
                loading="lazy"
              />
            </Magnet>
          </div>
        </FadeIn>

        {/* Bottom bar */}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 clamp(20px,5vw,60px) 36px", position: "relative", zIndex: 20 }}>
          <FadeIn delay={0.3}>
            <p style={{ color: T.text, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.4, fontSize: "clamp(0.7rem,1.3vw,1.3rem)", maxWidth: "clamp(140px,18vw,240px)" }}>
              Notes · PYQs · Syllabus · Study Materials
            </p>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.4}>
            <div style={{ display: "flex", gap: 0, borderRadius: 9999, border: `1px solid ${T.border}`, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
              <input
                type="text"
                placeholder="Search courses, notes, PYQs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: T.text, fontFamily: T.font, fontWeight: 300,
                  fontSize: "clamp(0.7rem,1.1vw,1rem)", padding: "12px 20px",
                  width: "clamp(160px,20vw,280px)",
                }}
              />
              <button onClick={handleSearch} style={{ ...T.pill, borderRadius: 9999, padding: "12px 24px", fontSize: "clamp(0.7rem,1vw,0.95rem)" }}>
                🔍 Search
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════ MARQUEE ══════════════ */}
      <MarqueeSection />

      {/* ══════════════ STATS ══════════════ */}
      <section style={{ background: T.bg, padding: "clamp(3rem,8vw,8rem) clamp(20px,5vw,60px)" }}>
        <FadeIn>
          <h2 style={sectionLabel}>By the Numbers</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {stats.map((s, i) => (
            <FadeIn key={s.key} delay={i * 0.08}>
              <div style={{
                border: `1px solid ${T.border}`, borderRadius: 24, padding: "32px 24px",
                textAlign: "center", background: "rgba(255,255,255,0.02)",
                transition: "border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(215,226,234,0.4)"; e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ ...T.gradientText, fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: T.muted, fontWeight: 400, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{s.title}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════ COURSES — white panel ══════════════ */}
      <section style={{ background: "#fff", borderRadius: "60px 60px 0 0", padding: "clamp(3rem,8vw,8rem) clamp(20px,5vw,60px)" }}>
        <FadeIn>
          <h2 style={{ ...sectionLabel, ...T.gradientText, background: "linear-gradient(180deg,#333 0%,#0C0C0C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Popular Courses
          </h2>
        </FadeIn>

        {loading ? (
          <div style={{ textAlign: "center", color: "#666", padding: "3rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#7621B0", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p>Loading courses…</p>
          </div>
        ) : displayCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <h3 style={{ color: "#0C0C0C", margin: "12px 0" }}>No courses found</h3>
            <button onClick={handleAddSampleCourses} disabled={loading} style={{ ...T.pill, padding: "12px 32px" }}>
              {loading ? "Adding…" : "➕ Add Sample Courses"}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(200px,28vw,300px),1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
            {displayCourses.map((course) => (
              <div key={course.id} style={{ cursor: "pointer" }} onClick={() => handleCourseClick(course.id)}>
                <CourseCard course={{ ...course, onCourseClick: () => handleCourseClick(course.id) }} />
              </div>
            ))}
          </div>
        )}

        {showAddCoursesBtn && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={handleAddSampleCourses} disabled={loading} style={{ ...T.pill, padding: "12px 32px", fontSize: 14 }}>
              {loading ? "Adding…" : "➕ Add Sample Courses"}
            </button>
          </div>
        )}
      </section>

      {/* ══════════════ MATERIALS — dark panel ══════════════ */}
      <section style={{ background: T.bg, borderRadius: "60px 60px 0 0", marginTop: -48, position: "relative", zIndex: 10, padding: "clamp(3rem,8vw,8rem) clamp(20px,5vw,60px)" }}>
        <FadeIn>
          <h2 style={sectionLabel}>Latest Materials</h2>
        </FadeIn>

        {materialsLoading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#B600A8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading latest materials…
          </div>
        ) : materialsError ? (
          <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p>{materialsError}</p>
          </div>
        ) : latestMaterials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p style={{ marginTop: 12 }}>No materials yet. Be the first to upload!</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(200px,28vw,300px),1fr))", gap: 20, maxWidth: 1100, margin: "0 auto 40px" }}>
              {latestMaterials.map((m) => <MaterialCard key={m.id} material={m} navigate={navigate} />)}
            </div>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => navigate("/all-materials")} style={{ ...T.pill, padding: "14px 48px", fontSize: "clamp(0.8rem,1.2vw,1rem)" }}>
                View All Materials →
              </button>
            </div>
          </>
        )}
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section style={{ background: "#fff", borderRadius: "60px 60px 0 0", marginTop: -48, position: "relative", zIndex: 20, padding: "clamp(3rem,8vw,8rem) clamp(20px,5vw,60px)" }}>
        <FadeIn>
          <h2 style={{ ...sectionLabel, background: "linear-gradient(180deg,#333 0%,#0C0C0C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Why Choose Us
          </h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div style={{
                border: "1px solid rgba(12,12,12,0.12)", borderRadius: 24,
                padding: "32px 24px", textAlign: "center",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(118,33,176,0.15)"; e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ color: "#0C0C0C", fontFamily: T.font, fontWeight: 700, fontSize: "clamp(1rem,2vw,1.4rem)", textTransform: "uppercase", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "rgba(12,12,12,0.55)", fontFamily: T.font, fontWeight: 300, fontSize: "clamp(0.8rem,1.4vw,1rem)" }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: T.bg, padding: "clamp(2rem,6vw,5rem) clamp(20px,5vw,60px) clamp(1.5rem,4vw,3rem)", borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
        <h2 style={{ ...T.gradientText, fontFamily: T.font, fontWeight: 900, fontSize: "clamp(2rem,8vw,7rem)", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 16 }}>
          Study Portal
        </h2>
        <p style={{ color: T.muted, fontWeight: 300, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          © 2025 Study Portal · Free resources for every student
        </p>
      </footer>

      {/* ── Spinner keyframe ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Home;
