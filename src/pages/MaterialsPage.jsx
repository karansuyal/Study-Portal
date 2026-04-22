import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
  FaDownload,
  FaEye,
  FaBook,
  FaFilePdf,
  FaFileAlt,
  FaQuestionCircle,
  FaHistory,
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaStar,
  FaSpinner,
  FaUser,
  FaSearch,
  FaFilter,
  FaFileWord,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaSync,
  FaCloudUploadAlt,
  FaYoutube,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {coursesData, getSubjects} from "../data/coursesData";
import api, {API_URL} from "../services/api";
import "./MaterialsPage.css";
import {useNoteStats} from "../hooks/useNoteStats";

const MaterialsPage = () => {
  const {courseId, yearId, semId, subjectId} = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ FLAG for one-time view increment
  const [viewsIncremented, setViewsIncremented] = useState(false);

  // Check mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ RATING COMPONENT - with useNoteStats
  const Rating = ({materialId, currentRating}) => {
    const stats = useNoteStats(materialId, {rating: currentRating});
    const [hover, setHover] = useState(0);
    const [isRated, setIsRated] = useState(false);

    const handleRating = async (value) => {
      if (isRated) return;
      setIsRated(true);
      await stats.updateRating(value);
      setTimeout(() => setIsRated(false), 2000);
    };

    return (
      <div
        style={isMobile ? styles.mobileRatingContainer : styles.ratingContainer}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => !isMobile && setHover(star)}
            onMouseLeave={() => !isMobile && setHover(0)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? "16px" : "20px",
              color: (hover || stats.rating) >= star ? "#ffc107" : "#e4e5e9",
              padding: isMobile ? "2px" : "0",
            }}
          >
            ★
          </button>
        ))}
        {!isMobile && (
          <span style={{fontSize: "14px", color: "#6c757d", marginLeft: "5px"}}>
            ({stats.rating?.toFixed(1) || "0"}) • {stats.ratingCount} ratings
          </span>
        )}
      </div>
    );
  };

  // ✅ MATERIAL TYPES - FIXED: 'youtube' id (lowercase, no space)
  const materialTypes = [
    {id: "all", name: "All Materials", icon: <FaFilter />, color: "#6b7280"},
    {id: "syllabus", name: "Syllabus", icon: <FaBook />, color: "#3B82F6"},
    {id: "notes", name: "Notes", icon: <FaFileAlt />, color: "#10B981"},
    {id: "pyq", name: "PYQs", icon: <FaHistory />, color: "#8B5CF6"},
    {
      id: "important",
      name: "Imp Questions",
      icon: <FaQuestionCircle />,
      color: "#F59E0B",
    },
    {id: "lab", name: "Lab Manuals", icon: <FaBookOpen />, color: "#EF4444"},
    {id: "youtube", name: "YouTube", icon: <FaYoutube />, color: "#FF0000"},
  ];

  // ✅ NOTIFICATION HELPER
  const showNotification = (title, message, type = "success") => {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "linear-gradient(135deg, #10b981, #34d399)" : "linear-gradient(135deg, #ef4444, #f87171)"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px ${type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"};
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
      <div style="font-size: 20px;">${type === "success" ? "✅" : "❌"}</div>
      <div>
        <div style="font-weight: 600;">${title}</div>
        <div style="font-size: 12px; opacity: 0.9;">${message}</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  // ✅ YOUTUBE CARD COMPONENT
  const YouTubeCard = ({material}) => {
    const stats = useNoteStats(material.id, {
      views: material.views || 0,
      downloads: material.downloads || 0,
      rating: material.rating || 0,
    });

    const handleWatchOnYouTube = () => {
      window.open(material.youtube_url, "_blank");
    };

    if (!isMobile) {
      return (
        <div style={styles.laptopYoutubeCard}>
          <div
            style={styles.laptopYoutubeThumbnail}
            onClick={handleWatchOnYouTube}
          >
            <img
              src={
                material.youtube_thumbnail ||
                `https://img.youtube.com/vi/${material.youtube_id}/mqdefault.jpg`
              }
              alt={material.title}
              style={styles.laptopYoutubeThumbnailImg}
              onError={(e) => {
                e.target.src = `https://img.youtube.com/vi/${material.youtube_id}/hqdefault.jpg`;
              }}
            />
            <div style={styles.laptopYoutubePlayIcon}>▶</div>
          </div>
          <div style={styles.laptopYoutubeContent}>
            <div style={styles.laptopMaterialHeader("#FF0000")}>
              <div style={styles.laptopMaterialType}>
                <span style={{color: "#FF0000", fontSize: "16px"}}>
                  <FaYoutube />
                </span>
                <span
                  style={{
                    color: "#FF0000",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  YouTube
                </span>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#6b7280",
                    fontSize: "12px",
                  }}
                >
                  <FaUser size={10} /> {material.user}
                </div>
              </div>
            </div>
            <div style={styles.laptopYoutubeTextContent}>
              <h4 style={styles.laptopMaterialTitle}>{material.title}</h4>
              <div style={styles.laptopMaterialStats}>
                <div style={styles.laptopStatItem}>
                  <FaClock color="#9ca3af" size={12} />
                  <span>{material.uploadDate}</span>
                </div>
                <div style={styles.laptopStatItem}>
                  <FaEye color="#9ca3af" size={12} />
                  <span>{stats.views} views</span>
                </div>
                <div style={styles.laptopStatItem}>
                  <FaStar color="#fbbf24" size={12} />
                  <span>{stats.rating.toFixed(1)}/5</span>
                </div>
                <div style={styles.laptopRatingContainer}>
                  <Rating
                    materialId={material.id}
                    currentRating={stats.rating}
                  />
                </div>
              </div>
            </div>
            <div style={styles.laptopMaterialActions}>
              <button
                style={styles.laptopYoutubeWatchButton}
                onClick={handleWatchOnYouTube}
              >
                <FaYoutube size={14} /> Watch on YouTube
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Mobile YouTube Card
    return (
      <div style={styles.mobileYoutubeCard}>
        <div
          style={styles.mobileYoutubeThumbnail}
          onClick={handleWatchOnYouTube}
        >
          <img
            src={
              material.youtube_thumbnail ||
              `https://img.youtube.com/vi/${material.youtube_id}/mqdefault.jpg`
            }
            alt={material.title}
            style={styles.mobileYoutubeThumbnailImg}
          />
          <div style={styles.mobileYoutubePlayIcon}>▶</div>
        </div>
        <div style={styles.mobileYoutubeContent}>
          <div style={styles.mobileMaterialHeader}>
            <div style={styles.mobileMaterialType}>
              <span style={{color: "#FF0000"}}>
                <FaYoutube />
              </span>
              <span style={{color: "#FF0000", fontWeight: "500"}}>YouTube</span>
            </div>
          </div>
          <div style={styles.mobileMaterialContent}>
            <h4 style={styles.mobileMaterialTitle}>{material.title}</h4>
            <div style={styles.mobileMaterialMeta}>
              <div style={styles.mobileMetaItem}>
                <FaClock /> {material.uploadDate}
              </div>
              <div style={styles.mobileMetaItem}>
                <FaEye /> {stats.views}
              </div>
            </div>
            <div style={styles.mobileRatingContainer}>
              <Rating materialId={material.id} currentRating={stats.rating} />
            </div>
          </div>
          <div style={styles.mobileMaterialActions}>
            <button
              style={styles.mobileYoutubeWatchButton}
              onClick={handleWatchOnYouTube}
            >
              <FaYoutube /> Watch on YouTube
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ REGULAR MATERIAL CARD COMPONENT
  const MaterialCard = ({material, typeInfo}) => {
    const [downloading, setDownloading] = useState(false);

    const stats = useNoteStats(material.id, {
      views: material.views || 0,
      downloads: material.downloads || 0,
      rating: material.rating || 0,
    });

    const handleDownload = async () => {
      setDownloading(true);

      try {
        stats.incrementDownload();

        if (material.cloudinary_url) {
          const response = await fetch(material.cloudinary_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = material.original_filename || `${material.title}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          showNotification("✅ Download Complete!", material.title, "success");
        } else {
          const token = localStorage.getItem("study_portal_token");
          if (!token) {
            showNotification("Error", "Please login again", "error");
            return;
          }
          const response = await fetch(
            `${API_URL}/notes/${material.id}/download`,
            {
              method: "GET",
              headers: {Authorization: `Bearer ${token}`},
            },
          );
          if (!response.ok)
            throw new Error(`Download failed: ${response.status}`);
          if (response.redirected) {
            window.open(response.url, "_blank");
          } else {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = material.file_name || `${material.title}.pdf`;
            link.click();
          }
          showNotification("✅ Download Complete!", material.title, "success");
        }
      } catch (error) {
        console.error("❌ Download error:", error);
        showNotification("Download Failed", error.message, "error");
      } finally {
        setDownloading(false);
      }
    };

    const handlePreview = () => {
      const previewModal = document.createElement("div");
      previewModal.id = "previewModal";
      previewModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;

      const previewContent = document.createElement("div");
      previewContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: ${isMobile ? "90%" : "500px"};
        width: ${isMobile ? "95%" : "90%"};
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      `;

      previewContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-bottom: 10px;">${material.title}</h3>
          <p style="color: #6b7280; font-size: 14px;">${material.description}</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>📁 File Type:</strong> ${material.fileType?.toUpperCase() || "PDF"}</p>
          <p style="margin: 5px 0;"><strong>📏 File Size:</strong> ${material.fileSize}</p>
          <p style="margin: 5px 0;"><strong>👤 Uploaded by:</strong> ${material.user}</p>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${material.uploadDate}</p>
          <p style="margin: 5px 0;"><strong>⭐ Rating:</strong> ${stats.rating.toFixed(1)}/5</p>
          <p style="margin: 5px 0;"><strong>📥 Downloads:</strong> ${stats.downloads}</p>
          <p style="margin: 5px 0;"><strong>👁️ Views:</strong> ${stats.views}</p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button id="previewDownloadBtn" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Download Now
          </button>
          <button id="previewCloseBtn" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Close
          </button>
        </div>
      `;

      previewModal.appendChild(previewContent);
      document.body.appendChild(previewModal);

      document.getElementById("previewDownloadBtn").onclick = () => {
        handleDownload();
        document.body.removeChild(previewModal);
      };

      document.getElementById("previewCloseBtn").onclick = () => {
        document.body.removeChild(previewModal);
      };

      previewModal.onclick = (e) => {
        if (e.target === previewModal) {
          document.body.removeChild(previewModal);
        }
      };
    };

    if (!isMobile) {
      return (
        <div style={styles.laptopMaterialCard}>
          <div style={styles.laptopMaterialHeader(typeInfo.color)}>
            <div style={styles.laptopMaterialType}>
              <span style={{color: typeInfo.color, fontSize: "16px"}}>
                {typeInfo.icon}
              </span>
              <span
                style={{
                  color: typeInfo.color,
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {typeInfo.name}
              </span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#6b7280",
                  fontSize: "12px",
                }}
              >
                <FaUser size={10} /> {material.user}
              </div>
            </div>
          </div>
          <div style={styles.laptopMaterialContent}>
            <h4 style={styles.laptopMaterialTitle}>{material.title}</h4>
            <div style={styles.laptopMaterialStats}>
              <div style={styles.laptopStatItem}>
                <FaClock color="#9ca3af" size={12} />
                <span>{material.uploadDate}</span>
              </div>
              <div style={styles.laptopStatItem}>
                <FaDownload color="#9ca3af" size={12} />
                <span>{stats.downloads} downloads</span>
              </div>
              <div style={styles.laptopStatItem}>
                <FaEye color="#9ca3af" size={12} />
                <span>{stats.views} views</span>
              </div>
              <div style={styles.laptopStatItem}>
                <FaStar color="#fbbf24" size={12} />
                <span>{stats.rating.toFixed(1)}/5</span>
              </div>
              <div style={styles.laptopRatingContainer}>
                <Rating materialId={material.id} currentRating={stats.rating} />
              </div>
            </div>
            <div style={styles.laptopFileInfo}>
              <span style={{display: "flex", alignItems: "center", gap: "5px"}}>
                {getFileIcon(material.fileType)}{" "}
                <span>{material.fileSize}</span>
              </span>
            </div>
          </div>
          <div style={styles.laptopMaterialActions}>
            <button style={styles.laptopPreviewButton} onClick={handlePreview}>
              <FaEye size={14} /> Preview
            </button>
            <button
              style={styles.laptopDownloadButton(downloading)}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <FaSpinner
                    style={{animation: "spin 1s linear infinite"}}
                    size={14}
                  />{" "}
                  Downloading...
                </>
              ) : (
                <>
                  <FaDownload size={14} /> Download
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.mobileMaterialCard}>
        {material.isNew && <span style={styles.mobileNewBadge}>NEW</span>}
        <div style={styles.mobileMaterialHeader}>
          <div style={styles.mobileMaterialType}>
            <span style={{color: typeInfo?.color}}>{typeInfo?.icon}</span>
            <span style={{color: typeInfo?.color, fontWeight: "500"}}>
              {typeInfo?.name}
            </span>
          </div>
        </div>
        <div style={styles.mobileMaterialContent}>
          <h4 style={styles.mobileMaterialTitle}>{material.title}</h4>
          <div style={styles.mobileMaterialMeta}>
            <div style={styles.mobileMetaItem}>
              <FaClock /> {material.uploadDate}
            </div>
            <div style={styles.mobileMetaItem}>
              <FaEye /> {stats.views}
            </div>
            <div style={styles.mobileMetaItem}>
              <FaDownload /> {stats.downloads}
            </div>
          </div>
          <div style={styles.mobileRatingContainer}>
            <Rating materialId={material.id} currentRating={stats.rating} />
          </div>
          <div style={styles.mobileFileInfo}>
            {getFileIcon(material.fileType)} <span>{material.fileSize}</span>
          </div>
        </div>
        <div style={styles.mobileMaterialActions}>
          <button style={styles.mobilePreviewButton} onClick={handlePreview}>
            <FaEye /> Preview
          </button>
          <button
            style={styles.mobileDownloadButton(downloading)}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <FaSpinner style={{animation: "spin 1s linear infinite"}} />{" "}
                Downloading
              </>
            ) : (
              <>
                <FaDownload /> Download
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ✅ FETCH MATERIALS FUNCTION
  const fetchMaterialsFromBackend = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);

    try {
      setError(null);
      console.log("📥 Fetching materials for subject:", subjectId);

      let response;
      try {
        response = await api.getMaterials({
          subject_id: subjectId,
          status: "approved",
        });
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Failed to connect to server. Please try again.");
        setMaterials([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("API Response:", response);

      let transformedMaterials = [];

      if (response && response.notes && response.notes.length > 0) {
        transformedMaterials = response.notes.map((note) => ({
          id: note.id,
          title: note.title || "Untitled",
          type: note.is_youtube
            ? "youtube"
            : note.note_type || note.type || "notes",
          description: (() => {
            if (!note.description) return "";

            try {
              const parsed = JSON.parse(note.description);

              return typeof parsed === "string"
                ? parsed
                : parsed.title ||
                    parsed.desc ||
                    Object.values(parsed).join(" ");
            } catch {
              return note.description;
            }
          })(),
          fileSize: note.file_size ? formatBytes(note.file_size) : "N/A",
          original_filename: note.original_filename,
          fileType: note.file_type || "pdf",
          uploadDate: note.uploaded_at
            ? new Date(note.uploaded_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          downloads: note.downloads || 0,
          views: note.views || 0,
          rating: note.rating || 0,
          rating_count: note.rating_count || 0,
          fileUrl: note.file_url || "#",
          cloudinary_url: note.cloudinary_url,
          user: note.user_name || note.uploader_name || "Unknown",
          isNew: note.uploaded_at
            ? new Date(note.uploaded_at) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            : false,
          is_youtube: note.is_youtube || false,
          youtube_url: note.youtube_url,
          youtube_id: note.youtube_id,
          youtube_thumbnail: note.youtube_thumbnail,
          youtube_embed_url: note.youtube_embed_url,
        }));
      }

      setMaterials(transformedMaterials);
      if (transformedMaterials.length === 0)
        setError("No approved materials found for this subject.");
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError("Failed to load materials. Please try again.");
      setMaterials([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "N/A";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || "pdf";
    if (type.includes("pdf")) return <FaFilePdf style={{color: "#ef4444"}} />;
    if (type.includes("doc") || type.includes("word"))
      return <FaFileWord style={{color: "#2563eb"}} />;
    if (type.includes("ppt") || type.includes("powerpoint"))
      return <FaFilePowerpoint style={{color: "#f97316"}} />;
    if (type.includes("jpg") || type.includes("png") || type.includes("jpeg"))
      return <FaFileImage style={{color: "#8b5cf6"}} />;
    if (type.includes("zip") || type.includes("rar"))
      return <FaFileArchive style={{color: "#6b7280"}} />;
    return <FaFileAlt style={{color: "#6b7280"}} />;
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const subjects = getSubjects(
          parseInt(courseId),
          parseInt(yearId),
          parseInt(semId),
        );
        const foundSubject = subjects.find(
          (sub) => sub.id === parseInt(subjectId),
        );
        if (foundSubject) {
          setSubject(foundSubject);
          setCourseInfo(coursesData[courseId]);
          await fetchMaterialsFromBackend();
        } else {
          setError("Subject not found in course data");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading subject:", error);
        setError("Failed to load subject information");
        setLoading(false);
      }
    };
    loadData();
  }, [courseId, yearId, semId, subjectId]);

  // ✅ VIEW INCREMENT ON FIRST PAGE LOAD
  useEffect(() => {
    const incrementViewsOnce = async () => {
      if (viewsIncremented) return;
      if (materials.length === 0 || !subject) return;
      console.log(
        "👁️ Auto-incrementing views for all materials (FIRST TIME ONLY)",
      );
      setViewsIncremented(true);
      for (const material of materials) {
        try {
          const token = localStorage.getItem("study_portal_token");
          await fetch(`${API_URL}/notes/${material.id}`, {
            method: "GET",
            headers: token ? {Authorization: `Bearer ${token}`} : {},
          });
          console.log(`✅ View incremented for ${material.title}`);
        } catch (error) {
          console.error(
            `❌ Error incrementing view for ${material.id}:`,
            error,
          );
        }
      }
      setTimeout(() => {
        fetchMaterialsFromBackend(true);
      }, 2000);
    };
    incrementViewsOnce();
  }, [materials, subject, viewsIncremented]);

  const handleBack = () =>
    navigate(`/course/${courseId}/year/${yearId}/sem/${semId}`);
  const handleRefresh = () => fetchMaterialsFromBackend(true);

  // ✅ FILTER MATERIALS
  const filteredMaterials = materials.filter((material) => {
    const matchesType =
      selectedType === "all" || material.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.user &&
        material.user.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getMaterialStats = () => {
    const stats = {};
    materialTypes.forEach((type) => {
      if (type.id !== "all") {
        stats[type.id] = materials.filter((m) => m.type === type.id).length;
      }
    });
    return stats;
  };
  const materialStats = getMaterialStats();

  // ==================== STYLES ====================
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: isMobile ? "10px" : "20px",
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    innerContainer: {maxWidth: "1200px", margin: "0 auto"},

    laptopMaterialsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "25px",
      alignItems: "stretch",
    },

    laptopMaterialCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.4s ease",
      background: "white",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },

    laptopYoutubeCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.4s ease",
      background: "white",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },

    laptopYoutubeThumbnail: {
      position: "relative",
      background: "#000",
      cursor: "pointer",
      overflow: "hidden",
      height: "140px",
      width: "100%",
    },
    laptopYoutubeThumbnailImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      transition: "transform 0.3s ease",
    },

    mobileMaterialsList: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "15px",
    },

    // Mobile YouTube Card
    mobileYoutubeCard: {
      background: "white",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
    },

    mobileYoutubeThumbnail: {
      position: "relative",
      background: "#000",
      cursor: "pointer",
      height: "120px",
      width: "100%",
    },
    mobileYoutubeThumbnailImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
    },
    // Laptop Styles (existing)
    laptopHeaderButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "15px",
    },
    laptopBackButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      background: "white",
      color: "#4f46e5",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    laptopRefreshButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      background: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
      transition: "all 0.3s ease",
    },
    laptopSubjectHeader: {
      background: "white",
      padding: "30px",
      borderRadius: "16px",
      marginBottom: "30px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "25px",
      flexWrap: "wrap",
    },
    laptopSubjectIconContainer: {
      width: "90px",
      height: "90px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    laptopSubjectIcon: {fontSize: "40px", color: "white"},
    laptopSubjectInfo: {flex: 1},
    laptopSubjectName: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "10px",
    },
    laptopSubjectCode: {
      fontSize: "18px",
      color: "#6b7280",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    laptopBreadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "#9ca3af",
      flexWrap: "wrap",
    },
    laptopBreadcrumbItem: {
      padding: "6px 12px",
      background: "#f3f4f6",
      borderRadius: "6px",
    },
    laptopCurrentBreadcrumb: {background: "#4f46e5", color: "white"},
    laptopStatsBox: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      borderRadius: "12px",
      color: "white",
      textAlign: "center",
      minWidth: "120px",
    },
    laptopStatsNumber: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "5px",
    },
    laptopStatsLabel: {fontSize: "14px", opacity: "0.9"},
    laptopLastRefreshed: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "10px",
      textAlign: "right",
    },
    laptopSearchContainer: {position: "relative", marginBottom: "25px"},
    laptopSearchInput: {
      width: "100%",
      padding: "16px 20px 16px 50px",
      fontSize: "16px",
      border: "2px solid #e5e7eb",
      borderRadius: "10px",
      background: "#f9fafb",
      transition: "all 0.3s",
      outline: "none",
    },
    laptopSearchIcon: {
      position: "absolute",
      left: "20px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: "18px",
    },
    laptopFiltersContainer: {
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "25px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    },
    laptopFiltersTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    laptopFiltersGrid: {display: "flex", flexWrap: "wrap", gap: "10px"},
    laptopFilterButton: (type, selected) => ({
      padding: "12px 20px",
      border: `2px solid ${selected ? type.color : "#e5e7eb"}`,
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "500",
      background: selected ? `${type.color}15` : "white",
      color: selected ? type.color : "#4b5563",
      transition: "all 0.3s",
    }),
    laptopFilterCount: {
      background: "#f3f4f6",
      color: "#6b7280",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    laptopMaterialsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "25px",
    },
    laptopMaterialCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.4s ease",
      background: "white",
      position: "relative",
    },
    laptopMaterialHeader: (color) => ({
      padding: "18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e5e7eb",
      background: `${color}10`,
    }),
    laptopMaterialType: {display: "flex", alignItems: "center", gap: "8px"},
    laptopMaterialContent: {padding: "25px"},
    laptopMaterialTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "12px",
      lineHeight: "1.4",
    },
    laptopMaterialDescription: {
      color: "#6b7280",
      fontSize: "14px",
      lineHeight: "1.6",
      marginBottom: "20px",
      minHeight: "60px",
    },
    laptopMaterialStats: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
      marginBottom: "20px",
      background: "#f9fafb",
      padding: "15px",
      borderRadius: "8px",
    },
    laptopStatItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#6b7280",
      fontSize: "13px",
    },
    laptopRatingContainer: {
      gridColumn: "span 2",
      display: "flex",
      justifyContent: "center",
      marginTop: "5px",
    },
    laptopFileInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "15px",
      borderTop: "1px solid #e5e7eb",
      fontSize: "13px",
      color: "#9ca3af",
    },
    laptopMaterialActions: {
      padding: "20px",
      background: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      gap: "12px",
    },
    laptopPreviewButton: {
      flex: 1,
      padding: "12px",
      background: "white",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: "600",
      color: "#4b5563",
      fontSize: "14px",
    },
    laptopDownloadButton: (downloading) => ({
      flex: 2,
      padding: "12px",
      background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: downloading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: "600",
      fontSize: "14px",
      opacity: downloading ? 0.7 : 1,
    }),

    // Mobile Styles
    mobileHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "white",
      padding: "12px 15px",
      borderRadius: "12px",
      marginBottom: "15px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    mobileBackButton: {
      background: "#f3f4f6",
      border: "none",
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      color: "#4f46e5",
      cursor: "pointer",
    },
    mobileTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#1f2937",
      flex: 1,
      textAlign: "center",
      padding: "0 10px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    mobileRefreshButton: {
      background: "#f3f4f6",
      border: "none",
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      color: "#10b981",
      cursor: "pointer",
    },
    mobileSubjectCard: {
      background: "white",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    mobileSubjectIconContainer: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    mobileSubjectIcon: {fontSize: "30px", color: "white"},
    mobileSubjectInfo: {flex: 1},
    mobileSubjectName: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "4px",
    },
    mobileSubjectCode: {
      fontSize: "13px",
      color: "#6b7280",
      marginBottom: "6px",
    },
    mobileSubjectMeta: {
      display: "flex",
      gap: "12px",
      fontSize: "12px",
      color: "#4f46e5",
      flexWrap: "wrap",
    },
    mobileSearchContainer: {position: "relative", marginBottom: "15px"},
    mobileSearchIcon: {
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: "16px",
    },
    mobileSearchInput: {
      width: "100%",
      padding: "14px 45px 14px 45px",
      fontSize: "14px",
      border: "none",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      outline: "none",
    },
    mobileClearButton: {
      position: "absolute",
      right: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "#9ca3af",
      fontSize: "16px",
      cursor: "pointer",
      padding: "5px",
    },
    mobileFilterToggle: {
      width: "100%",
      padding: "12px",
      background: "white",
      border: "none",
      borderRadius: "12px",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#4f46e5",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    mobileFiltersContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "15px",
      background: "white",
      padding: "15px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    mobileFilterButton: (type, selected) => ({
      padding: "8px 12px",
      border: `1px solid ${selected ? type.color : "#e5e7eb"}`,
      borderRadius: "20px",
      background: selected ? `${type.color}15` : "white",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      fontWeight: "500",
      color: selected ? type.color : "#4b5563",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    mobileFilterCount: {
      background: "#f3f4f6",
      color: "#6b7280",
      padding: "2px 6px",
      borderRadius: "12px",
      fontSize: "10px",
      marginLeft: "4px",
    },
    mobileErrorMessage: {
      background: "#fee2e2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "13px",
    },
    mobileEmptyState: {
      background: "white",
      padding: "40px 20px",
      borderRadius: "16px",
      textAlign: "center",
    },
    mobileEmptyIcon: {fontSize: "48px", marginBottom: "15px", opacity: 0.5},
    mobileUploadButton: {
      marginTop: "15px",
      padding: "12px 24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
    },
    mobileMaterialsList: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "15px",
    },
    mobileMaterialCard: {
      background: "white",
      borderRadius: "16px",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    mobileNewBadge: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "#ef4444",
      color: "white",
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "bold",
      zIndex: 1,
    },
    mobileMaterialHeader: {
      padding: "12px 15px",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    mobileMaterialType: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
    },
    mobileMaterialContent: {padding: "15px"},
    mobileMaterialTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "8px",
      lineHeight: "1.4",
    },
    mobileMaterialDescription: {
      fontSize: "13px",
      color: "#6b7280",
      marginBottom: "12px",
      lineHeight: "1.5",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    mobileMaterialMeta: {
      display: "flex",
      gap: "12px",
      marginBottom: "12px",
      fontSize: "11px",
      color: "#9ca3af",
      flexWrap: "wrap",
    },
    mobileMetaItem: {display: "flex", alignItems: "center", gap: "4px"},
    mobileRatingContainer: {
      display: "flex",
      alignItems: "center",
      gap: "3px",
      marginBottom: "12px",
    },
    mobileFileInfo: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11px",
      color: "#9ca3af",
      paddingTop: "8px",
      borderTop: "1px solid #e5e7eb",
    },
    mobileMaterialActions: {
      display: "flex",
      gap: "8px",
      padding: "15px",
      background: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
    },
    mobilePreviewButton: {
      flex: 1,
      padding: "10px",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "500",
      color: "#4b5563",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      cursor: "pointer",
    },
    mobileDownloadButton: (downloading) => ({
      flex: 2,
      padding: "10px",
      background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      cursor: downloading ? "not-allowed" : "pointer",
      opacity: downloading ? 0.7 : 1,
    }),
    loadingContainer: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    loadingSpinner: {
      width: isMobile ? "40px" : "50px",
      height: isMobile ? "40px" : "50px",
      border: isMobile
        ? "3px solid rgba(255,255,255,0.3)"
        : "5px solid rgba(255,255,255,0.3)",
      borderTop: isMobile ? "3px solid white" : "5px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: isMobile ? "10px" : "20px",
    },
    errorContainer: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "20px",
      textAlign: "center",
    },
    backButton: {
      padding: isMobile ? "10px 20px" : "12px 24px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "16px",
      marginTop: "20px",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  // ✅ SUBJECT NOT FOUND
  if (!subject) {
    return (
      <div style={styles.errorContainer}>
        <div
          style={{fontSize: isMobile ? "48px" : "60px", marginBottom: "20px"}}
        >
          🔍
        </div>
        <h2 style={{fontSize: isMobile ? "20px" : "24px"}}>
          Subject not found
        </h2>
        <button style={styles.backButton} onClick={handleBack}>
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  // ✅ LAPTOP VIEW
  if (!isMobile) {
    return (
      <div style={styles.container}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `}</style>
        <div style={styles.innerContainer}>
          <div style={styles.laptopHeaderButtons}>
            <button style={styles.laptopBackButton} onClick={handleBack}>
              <FaArrowLeft /> Back to Subjects
            </button>
            <div style={{display: "flex", gap: "10px"}}>
              <button
                style={styles.laptopRefreshButton}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FaSync
                  style={{
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                  }}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                style={{...styles.laptopRefreshButton, background: "#8b5cf6"}}
                onClick={() => navigate("/upload")}
              >
                <FaCloudUploadAlt /> Upload
              </button>
            </div>
          </div>
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              ⚠️ {error}
            </div>
          )}
          <div style={styles.laptopLastRefreshed}>
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </div>
          <div style={styles.laptopSubjectHeader}>
            <div style={styles.laptopSubjectIconContainer}>
              <div style={styles.laptopSubjectIcon}>📚</div>
            </div>
            <div style={styles.laptopSubjectInfo}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div>
                  <h1 style={styles.laptopSubjectName}>{subject.name}</h1>
                  <div style={styles.laptopSubjectCode}>
                    <span>
                      Code: <strong>{subject.code}</strong>
                    </span>
                    <span>
                      ⭐ <strong>{subject.credits} Credits</strong>
                    </span>
                    <span>
                      📁 <strong>{materials.length} Materials</strong>
                    </span>
                    <span>
                      🏷️ <strong>{subject.type || "Theory"}</strong>
                    </span>
                  </div>
                  <div style={styles.laptopBreadcrumb}>
                    <span style={styles.laptopBreadcrumbItem}>
                      {courseInfo?.name || `Course ${courseId}`}
                    </span>
                    <span>→</span>
                    <span style={styles.laptopBreadcrumbItem}>
                      Year {yearId}
                    </span>
                    <span>→</span>
                    <span style={styles.laptopBreadcrumbItem}>
                      Semester {semId}
                    </span>
                    <span>→</span>
                    <span
                      style={{
                        ...styles.laptopBreadcrumbItem,
                        ...styles.laptopCurrentBreadcrumb,
                      }}
                    >
                      {subject.name}
                    </span>
                  </div>
                </div>
                <div style={styles.laptopStatsBox}>
                  <div style={styles.laptopStatsNumber}>{materials.length}</div>
                  <div style={styles.laptopStatsLabel}>Total Files</div>
                  <div
                    style={{
                      ...styles.laptopStatsLabel,
                      fontSize: "12px",
                      marginTop: "5px",
                    }}
                  >
                    {materials.filter((m) => m.isNew).length} New
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.laptopSearchContainer}>
            <div style={styles.laptopSearchIcon}>
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder={`Search in ${subject.name} materials...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.laptopSearchInput}
            />
            {searchQuery && (
              <button
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
          <div style={styles.laptopFiltersContainer}>
            <h3 style={styles.laptopFiltersTitle}>
              <FaFilter /> Filter by Material Type
            </h3>
            <div style={styles.laptopFiltersGrid}>
              {materialTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  style={styles.laptopFilterButton(
                    type,
                    selectedType === type.id,
                  )}
                >
                  <span style={{color: type.color}}>{type.icon}</span>{" "}
                  {type.name}
                  {type.id !== "all" && (
                    <span style={styles.laptopFilterCount}>
                      {materialStats[type.id] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {filteredMaterials.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "60px 20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{fontSize: "60px", marginBottom: "20px", opacity: "0.5"}}
              >
                📭
              </div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "10px",
                }}
              >
                No materials found
              </h3>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "16px",
                  marginBottom: "30px",
                }}
              >
                {searchQuery
                  ? `No materials match "${searchQuery}"`
                  : "No approved materials available yet. Upload something!"}
              </p>
              <div
                style={{display: "flex", gap: "15px", justifyContent: "center"}}
              >
                <button
                  style={{
                    padding: "12px 30px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                  onClick={() => navigate("/upload")}
                >
                  <FaCloudUploadAlt style={{marginRight: "8px"}} /> Upload
                  Materials
                </button>
                {searchQuery && (
                  <button
                    style={{
                      padding: "12px 30px",
                      background: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  {selectedType === "all"
                    ? "All Study Materials"
                    : materialTypes.find((t) => t.id === selectedType)?.name}
                </h3>
                <span
                  style={{
                    background: "#f3f4f6",
                    padding: "5px 15px",
                    borderRadius: "20px",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}
                >
                  {filteredMaterials.length} material
                  {filteredMaterials.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={styles.laptopMaterialsGrid}>
                {filteredMaterials.map((material) => {
                  if (material.is_youtube || material.type === "youtube") {
                    return (
                      <YouTubeCard key={material.id} material={material} />
                    );
                  }
                  const typeInfo =
                    materialTypes.find((t) => t.id === material.type) ||
                    materialTypes[1];
                  return (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      typeInfo={typeInfo}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ MOBILE VIEW
  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={styles.innerContainer}>
        <div style={styles.mobileHeader}>
          <button style={styles.mobileBackButton} onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h2 style={styles.mobileTitle}>{subject.name}</h2>
          <button style={styles.mobileRefreshButton} onClick={handleRefresh}>
            <FaSync
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>
        <div style={styles.mobileSubjectCard}>
          <div style={styles.mobileSubjectIconContainer}>
            <span style={styles.mobileSubjectIcon}>📚</span>
          </div>
          <div style={styles.mobileSubjectInfo}>
            <h1 style={styles.mobileSubjectName}>{subject.name}</h1>
            <p style={styles.mobileSubjectCode}>{subject.code}</p>
            <div style={styles.mobileSubjectMeta}>
              <span>🎓 {subject.credits} Credits</span>
              <span>📁 {materials.length} Files</span>
            </div>
          </div>
        </div>
        <div style={styles.mobileSearchContainer}>
          <div style={styles.mobileSearchIcon}>
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.mobileSearchInput}
          />
          {searchQuery && (
            <button
              style={styles.mobileClearButton}
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
        <button
          style={styles.mobileFilterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        {showFilters && (
          <div style={styles.mobileFiltersContainer}>
            {materialTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={styles.mobileFilterButton(
                  type,
                  selectedType === type.id,
                )}
              >
                <span style={{color: type.color}}>{type.icon}</span> {type.name}
                {type.id !== "all" && (
                  <span style={styles.mobileFilterCount}>
                    {materialStats[type.id] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {error && <div style={styles.mobileErrorMessage}>⚠️ {error}</div>}
        {filteredMaterials.length === 0 ? (
          <div style={styles.mobileEmptyState}>
            <div style={styles.mobileEmptyIcon}>📭</div>
            <h3 style={{fontSize: "18px", marginBottom: "10px"}}>
              No materials found
            </h3>
            <p
              style={{fontSize: "14px", color: "#6b7280", marginBottom: "20px"}}
            >
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Upload something!"}
            </p>
            <button
              style={styles.mobileUploadButton}
              onClick={() => navigate("/upload")}
            >
              <FaCloudUploadAlt /> Upload
            </button>
          </div>
        ) : (
          <div style={styles.mobileMaterialsList}>
            {filteredMaterials.map((material) => {
              if (material.is_youtube || material.type === "youtube") {
                return <YouTubeCard key={material.id} material={material} />;
              }
              const typeInfo =
                materialTypes.find((t) => t.id === material.type) ||
                materialTypes[1];
              return (
                <MaterialCard
                  key={material.id}
                  material={material}
                  typeInfo={typeInfo}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
