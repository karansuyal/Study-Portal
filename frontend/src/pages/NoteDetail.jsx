import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaUser,
  FaSpinner,
  FaFilePdf,
  FaFileAlt,
  FaFileWord,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaYoutube,
} from "react-icons/fa";
import api, { API_URL } from "../services/api";
import StarRating from "../components/StarRating";
import ShareButtons from "../components/ShareButtons";
import PurchaseModal from "../components/PurchaseModal";
import { useNoteStats } from "../hooks/useNoteStats";

// Where the SPA itself is hosted — used to build the canonical/OG URL.
// Kept as one constant so it's the only place to change if the domain
// ever moves.
const SITE_URL = "https://study-portal-app.vercel.app";

const getCleanDescription = (desc) => {
  if (!desc) return "";
  if (desc.includes("--- Academic Details ---")) {
    return desc.split("--- Academic Details ---")[0].trim() || "";
  }
  if (desc.trim().startsWith("{") || desc.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(desc);
      if (parsed.description) return parsed.description;
      if (parsed.ops) return parsed.ops.map((op) => op.insert).join("").trim();
      return "";
    } catch {
      return desc;
    }
  }
  return desc;
};

const getFileIcon = (fileType) => {
  const type = (fileType || "pdf").toLowerCase();
  if (type.includes("pdf")) return <FaFilePdf style={{ color: "#ef4444" }} />;
  if (type.includes("doc") || type.includes("word")) return <FaFileWord style={{ color: "#2563eb" }} />;
  if (type.includes("ppt") || type.includes("powerpoint")) return <FaFilePowerpoint style={{ color: "#f97316" }} />;
  if (["jpg", "png", "jpeg"].some((t) => type.includes(t))) return <FaFileImage style={{ color: "#8b5cf6" }} />;
  if (type.includes("zip") || type.includes("rar")) return <FaFileArchive style={{ color: "#6b7280" }} />;
  return <FaFileAlt style={{ color: "#6b7280" }} />;
};

const NoteDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [darkMode] = useState(document.documentElement.getAttribute("data-theme") === "dark");

  const stats = useNoteStats(note?.id, {
    views: note?.views || 0,
    downloads: note?.downloads || 0,
    rating: note?.rating || 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getNoteBySlug(slug);
        if (cancelled) return;
        if (response && response.success && response.note) {
          setNote(response.note);
        } else {
          setError("Note not found");
        }
      } catch (err) {
        if (!cancelled) setError("Note not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const pageUrl = `${SITE_URL}/notes/${slug}`;

  const handleDownload = async () => {
    if (!note) return;
    if (note.locked) {
      setShowPurchase(true);
      return;
    }

    setDownloading(true);
    try {
      stats.incrementDownload();

      if (note.cloudinary_url) {
        const response = await fetch(note.cloudinary_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = note.original_filename || `${note.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const token = localStorage.getItem("study_portal_token");
        const response = await fetch(`${API_URL}/notes/${note.id}/download`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        if (response.redirected) {
          window.open(response.url, "_blank");
        } else {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = note.file_name || `${note.title}.pdf`;
          link.click();
        }
      }
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleView = () => {
    if (!note) return;
    if (note.locked) {
      setShowPurchase(true);
      return;
    }
    if (note.cloudinary_url) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(note.cloudinary_url)}&embedded=true`;
      window.open(viewerUrl, "_blank");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: darkMode ? "#0e0e14" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
    },
    inner: { maxWidth: "800px", margin: "0 auto" },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      background: darkMode ? "#18181f" : "white",
      color: "#7c6ff7",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      marginBottom: "20px",
      boxShadow: darkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.1)",
    },
    card: {
      background: darkMode ? "#18181f" : "white",
      borderRadius: "16px",
      padding: "35px",
      boxShadow: darkMode ? "0 10px 25px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.1)",
    },
    breadcrumb: {
      fontSize: "13px",
      color: darkMode ? "#a0a0b8" : "#6b7280",
      marginBottom: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: darkMode ? "#f0f0fa" : "#1f2937",
      marginBottom: "14px",
      lineHeight: 1.3,
    },
    meta: {
      display: "flex",
      flexWrap: "wrap",
      gap: "18px",
      color: darkMode ? "#a0a0b8" : "#6b7280",
      fontSize: "14px",
      marginBottom: "20px",
    },
    metaItem: { display: "flex", alignItems: "center", gap: "6px" },
    description: {
      color: darkMode ? "#c0c0d0" : "#374151",
      fontSize: "15px",
      lineHeight: 1.7,
      marginBottom: "25px",
      whiteSpace: "pre-wrap",
    },
    ratingRow: { marginBottom: "25px" },
    actions: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "30px" },
    viewBtn: {
      flex: "1 1 160px",
      padding: "14px",
      background: darkMode ? "#252530" : "white",
      border: darkMode ? "2px solid rgba(255,255,255,0.1)" : "2px solid #e5e7eb",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: "600",
      fontSize: "15px",
      color: darkMode ? "#f0f0fa" : "#4b5563",
    },
    downloadBtn: (busy) => ({
      flex: "2 1 220px",
      padding: "14px",
      background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: busy ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: "700",
      fontSize: "15px",
      opacity: busy ? 0.7 : 1,
    }),
    shareBox: {
      borderTop: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
      paddingTop: "24px",
    },
    shareLabel: {
      fontSize: "13px",
      fontWeight: "700",
      color: darkMode ? "#a0a0b8" : "#6b7280",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    centerState: {
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      padding: "20px",
    },
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Helmet>
          <title>Loading… | Study Portal</title>
        </Helmet>
        <div style={styles.centerState}>
          <FaSpinner size={40} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
          <p style={{ marginTop: "15px" }}>Loading note…</p>
        </div>
      </div>
    );
  }

  // ---- Not found state ----
  if (error || !note) {
    return (
      <div style={styles.page}>
        <Helmet>
          <title>Note not found | Study Portal</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div style={styles.centerState}>
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>🔍</div>
          <h2>This note couldn't be found</h2>
          <p style={{ opacity: 0.85, marginBottom: "20px" }}>
            It may have been removed, or the link might be incorrect.
          </p>
          <button style={styles.backBtn} onClick={() => navigate("/all-materials")}>
            <FaArrowLeft /> Browse all materials
          </button>
        </div>
      </div>
    );
  }

  const cleanDescription = getCleanDescription(note.description);
  const metaDescription = (
    cleanDescription ||
    `Download ${note.title} — ${note.note_type || "study material"} for ${note.subject_name || note.course_name} on Study Portal. Free, student-uploaded, ready to view or download.`
  ).slice(0, 160);
  const ogImage = note.youtube_thumbnail || `${SITE_URL}/logo.png`;

  return (
    <div style={styles.page}>
      <Helmet>
        <title>{`${note.title} | ${note.subject_name || note.course_name} Notes | Study Portal`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph — what WhatsApp/Telegram/Facebook show in link previews.
            NOTE: these crawlers don't execute JavaScript, so for a preview
            card to actually render when a student shares this link in a
            group, the same tags also need to be served in the raw HTML —
            see frontend/middleware.js, which does that for bot user-agents. */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={note.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Study Portal" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={note.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div style={styles.inner}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div style={styles.card}>
          <div style={styles.breadcrumb}>
            <Link to="/all-materials" style={{ color: "inherit", textDecoration: "none" }}>
              All Materials
            </Link>
            {" › "}
            {note.course_name} {note.subject_name && `› ${note.subject_name}`}
          </div>

          <h1 style={styles.title}>{note.title}</h1>

          <div style={styles.meta}>
            <span style={styles.metaItem}>
              <FaUser size={12} /> {note.user_name}
            </span>
            <span style={styles.metaItem}>
              <FaClock size={12} /> {note.uploaded_at ? new Date(note.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
            </span>
            <span style={styles.metaItem}>
              <FaEye size={12} /> {stats.views} views
            </span>
            {!note.is_youtube && (
              <span style={styles.metaItem}>
                {getFileIcon(note.file_type)} {note.file_type?.toUpperCase()} {note.file_size ? `· ${Math.round(note.file_size / 1024)} KB` : ""}
              </span>
            )}
          </div>

          {cleanDescription && <p style={styles.description}>{cleanDescription}</p>}

          <div style={styles.ratingRow}>
            <StarRating noteId={note.id} size="md" />
          </div>

          {note.is_youtube ? (
            <div style={styles.actions}>
              <a
                href={note.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.downloadBtn(false), background: "#FF0000", textDecoration: "none" }}
              >
                <FaYoutube size={16} /> Watch on YouTube
              </a>
            </div>
          ) : (
            <div style={styles.actions}>
              <button style={styles.viewBtn} onClick={handleView}>
                {note.locked ? <FaEyeSlash size={15} /> : <FaEye size={15} />} View
              </button>
              <button
                style={{
                  ...styles.downloadBtn(downloading),
                  ...(note.locked ? { background: "linear-gradient(90deg, #f59e0b, #d97706)" } : {}),
                }}
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} size={15} /> Downloading…
                  </>
                ) : note.locked ? (
                  <>🔒 Unlock — {note.price_display}</>
                ) : (
                  <>
                    <FaDownload size={15} /> Download
                  </>
                )}
              </button>
            </div>
          )}

          <div style={styles.shareBox}>
            <div style={styles.shareLabel}>Share with your classmates</div>
            <ShareButtons url={pageUrl} title={note.title} size="md" variant="stacked" darkMode={darkMode} />
          </div>
        </div>

        {showPurchase && (
          <PurchaseModal
            note={note}
            onClose={() => setShowPurchase(false)}
            onUnlocked={async () => {
              setShowPurchase(false);
              const response = await api.getNoteBySlug(slug);
              if (response?.success) setNote(response.note);
            }}
          />
        )}
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
    </div>
  );
};

export default NoteDetail;
