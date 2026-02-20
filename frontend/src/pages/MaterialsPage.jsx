import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaDownload, FaEye, FaBook, FaFilePdf, FaFileAlt, 
  FaQuestionCircle, FaHistory, FaArrowLeft, FaBookOpen, 
  FaClock, FaStar, FaSpinner, FaUser, FaSearch,
  FaFilter, FaFileWord, FaFilePowerpoint, FaFileImage,
  FaFileArchive, FaSync, FaCloudUploadAlt
} from 'react-icons/fa';
import { coursesData, getSubjects } from '../data/coursesData';
import api from '../services/api';
import './MaterialsPage.css';

const MaterialsPage = () => {
  const { courseId, yearId, semId, subjectId } = useParams();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [downloading, setDownloading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // ✅ RATING COMPONENT
const Rating = ({ materialId, currentRating, onRate, userRating: initialUserRating }) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(initialUserRating || null);
  
  // Fetch user's existing rating on load
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const token = localStorage.getItem('study_portal_token');
        const response = await fetch(`http://localhost:5000/api/notes/${materialId}/user-rating`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserRating(data.rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };
    fetchUserRating();
  }, [materialId]);
  
  const handleRating = async (value) => {
    try {
      const token = localStorage.getItem('study_portal_token');
      const response = await fetch(`http://localhost:5000/api/notes/${materialId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: value })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRating(value);
        setRating(data.new_rating);
        if (onRate) onRate(data.new_rating);
      }
    } catch (error) {
      console.error('Rating error:', error);
    }
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color: (hover || userRating || rating) >= star ? '#ffc107' : '#e4e5e9',
            opacity: userRating === star ? 1 : 0.8,
            transform: userRating === star ? 'scale(1.2)' : 'scale(1)'
          }}
        >
          ★
        </button>
      ))}
      <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '5px' }}>
        ({rating?.toFixed(1) || '0'}) • {userRating ? `Your rating: ${userRating}★` : 'Rate now'}
      </span>
    </div>
  );
};

  // Material types
  const materialTypes = [
    { id: 'all', name: 'All Materials', icon: <FaFilter />, color: '#6b7280' },
    { id: 'syllabus', name: 'Syllabus', icon: <FaBook />, color: '#3B82F6' },
    { id: 'notes', name: 'Notes', icon: <FaFileAlt />, color: '#10B981' },
    { id: 'pyq', name: 'PYQs', icon: <FaHistory />, color: '#8B5CF6' },
    { id: 'important', name: 'Imp Questions', icon: <FaQuestionCircle />, color: '#F59E0B' },
    { id: 'lab', name: 'Lab Manuals', icon: <FaBookOpen />, color: '#EF4444' },
    { id: 'assignment', name: 'Assignments', icon: <FaFilePdf />, color: '#EC4899' }
  ];

  // ✅ PREVIEW FUNCTION
  const handlePreview = (material) => {
    const previewContent = `
      <div style="padding: 20px; max-width: 500px;">
        <h3 style="color: #1f2937; margin-bottom: 10px;">${material.title}</h3>
        <p style="color: #6b7280; margin-bottom: 15px;">${material.description}</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>📁 File Type:</strong> ${material.fileType?.toUpperCase() || 'PDF'}</p>
          <p style="margin: 5px 0;"><strong>📏 File Size:</strong> ${material.fileSize}</p>
          <p style="margin: 5px 0;"><strong>👤 Uploaded by:</strong> ${material.user}</p>
          <p style="margin: 5px 0;"><strong>📅 Upload Date:</strong> ${material.uploadDate}</p>
          <p style="margin: 5px 0;"><strong>⭐ Rating:</strong> ${material.rating}/5</p>
          <p style="margin: 5px 0;"><strong>📥 Downloads:</strong> ${material.downloads}</p>
          <p style="margin: 5px 0;"><strong>👁️ Views:</strong> ${material.views}</p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button onclick="handlePreviewDownload()" style="flex: 1; padding: 10px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Download Now
          </button>
          <button onclick="window.closeModal()" style="flex: 1; padding: 10px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'previewModal';
    modal.style.cssText = `
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
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    `;
    modalContent.innerHTML = previewContent;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    window.closeModal = () => {
      document.body.removeChild(modal);
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeModal();
      }
    });
    
    window.handlePreviewDownload = () => {
      handleDownload(material);
      window.closeModal();
    };
  };

  // ✅ DOWNLOAD FUNCTION
  const handleDownload = async (material) => {
    setDownloading(prev => ({ ...prev, [material.id]: true }));
    
    try {
      const token = localStorage.getItem('study_portal_token');
      
      if (!token) {
        showNotification('Error', 'Please login again', 'error');
        return;
      }
      
      console.log('📥 Downloading material:', material.id);
      
      const response = await fetch(`http://localhost:5000/api/notes/${material.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = material.original_filename || `${material.title}.${material.fileType || 'pdf'}`;
      
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
      
      showNotification('✅ Download Complete!', material.title, 'success');
      
      setMaterials(prev =>
        prev.map(m =>
          m.id === material.id
            ? { ...m, downloads: m.downloads + 1 }
            : m
        )
      );
      
    } catch (error) {
      console.error('❌ Download error:', error);
      showNotification('Download Failed', error.message, 'error');
    } finally {
      setDownloading(prev => ({ ...prev, [material.id]: false }));
    }
  };

  // ✅ NOTIFICATION HELPER
  const showNotification = (title, message, type = 'success') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 20px;">${type === 'success' ? '✅' : '❌'}</div>
      <div>
        <div style="font-weight: 600;">${title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${message}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // ✅ FETCH MATERIALS FUNCTION
// ✅ FETCH MATERIALS FUNCTION - with views fix
const fetchMaterialsFromBackend = async (showRefreshIndicator = false) => {
  if (showRefreshIndicator) setRefreshing(true);
  
  try {
    setError(null);
    
    console.log('📥 Fetching materials for subject:', subjectId);
    
    let response;
    try {
      response = await api.getMaterials({
        subject_id: subjectId,
        status: 'approved'
      });
    } catch (apiError) {
      console.error('API Error:', apiError);
      setError('Failed to connect to server. Please try again.');
      setMaterials([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    console.log('API Response:', response);
    
    let transformedMaterials = [];
    
    if (response && response.notes && response.notes.length > 0) {
      transformedMaterials = response.notes.map((note) => ({
        id: note.id,
        title: note.title || 'Untitled',
        type: note.note_type || note.type || 'notes',
        description: note.description || 'No description available',
        fileSize: note.file_size ? formatBytes(note.file_size) : 'N/A',
        pages: note.pages || 0,
        uploadDate: note.uploaded_at ? new Date(note.uploaded_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : 'N/A',
        downloads: note.downloads || 0,
        // ✅ Ensure views is properly handled
        views: note.views || 0,
        rating: note.rating || 0,
        rating_count: note.rating_count || 0,
        fileUrl: note.file_url || '#',
        fileType: note.file_type || 'pdf',
        user: note.user_name || note.uploader_name || 'Unknown',
        isNew: note.uploaded_at ? new Date(note.uploaded_at) > new Date(Date.now() - 7*24*60*60*1000) : false
      }));
    }
    
    setMaterials(transformedMaterials);
    
    if (transformedMaterials.length === 0) {
      setError('No approved materials found for this subject.');
    }
    
    setLastRefreshed(new Date());
    
  } catch (error) {
    console.error('Error fetching materials:', error);
    setError('Failed to load materials. Please try again.');
    setMaterials([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // ✅ FORMAT BYTES
  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const subjects = getSubjects(parseInt(courseId), parseInt(yearId), parseInt(semId));
        const foundSubject = subjects.find(sub => sub.id === parseInt(subjectId));
        
        if (foundSubject) {
          setSubject(foundSubject);
          setCourseInfo(coursesData[courseId]);
          await fetchMaterialsFromBackend();
        } else {
          setError('Subject not found in course data');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading subject:', error);
        setError('Failed to load subject information');
        setLoading(false);
      }
    };
    
    loadData();
    
    const interval = setInterval(() => {
      if (subject && !loading) {
        console.log('Auto-refreshing materials...');
        fetchMaterialsFromBackend(true);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [courseId, yearId, semId, subjectId]);

  const handleBack = () => {
    navigate(`/course/${courseId}/year/${yearId}/sem/${semId}`);
  };

  const handleRefresh = () => {
    fetchMaterialsFromBackend(true);
  };

 // Session storage mein track karo ki already view count ho chuka hai
// ✅ DEBUG VERSION - Console mein sab dikhega
useEffect(() => {
  const incrementViews = async () => {
    console.log('📢 incrementViews called with materials:', materials);
    
    if (materials.length === 0) {
      console.log('⚠️ No materials to increment views');
      return;
    }
    
    for (const material of materials) {
      console.log(`📢 Calling views API for material ${material.id}`);
      
      try {
        const token = localStorage.getItem('study_portal_token');
        console.log(`📢 Token exists:`, !!token);
        
        const response = await fetch(`http://localhost:5000/api/notes/${material.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📢 Response status for ${material.id}:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📢 Response data for ${material.id}:`, data);
          console.log(`📢 Views count now:`, data.note.views);
        } else {
          console.log(`❌ Error response:`, await response.text());
        }
      } catch (err) {
        console.error(`❌ Fetch error for ${material.id}:`, err);
      }
    }
  };
  
  incrementViews();
}, [materials]);  // ✅ Sirf materials change par call

  // ✅ FILTER MATERIALS
  const filteredMaterials = materials.filter(material => {
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesSearch = searchQuery === '' ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.user && material.user.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // ✅ GET FILE ICON
  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || 'pdf';
    if (type.includes('pdf')) return <FaFilePdf style={{ color: '#ef4444' }} />;
    if (type.includes('doc') || type.includes('word')) return <FaFileWord style={{ color: '#2563eb' }} />;
    if (type.includes('ppt') || type.includes('powerpoint')) return <FaFilePowerpoint style={{ color: '#f97316' }} />;
    if (type.includes('jpg') || type.includes('png') || type.includes('jpeg')) return <FaFileImage style={{ color: '#8b5cf6' }} />;
    if (type.includes('zip') || type.includes('rar')) return <FaFileArchive style={{ color: '#6b7280' }} />;
    return <FaFileAlt style={{ color: '#6b7280' }} />;
  };

  // ✅ MATERIAL STATS
  const getMaterialStats = () => {
    const stats = {};
    materialTypes.forEach(type => {
      if (type.id !== 'all') {
        stats[type.id] = materials.filter(m => m.type === type.id).length;
      }
    });
    return stats;
  };

  const materialStats = getMaterialStats();

  // ✅ STYLES
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    },
    innerContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    headerButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'white',
      color: '#4f46e5',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    refreshButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '16px',
      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease'
    },
    subjectHeader: {
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      marginBottom: '30px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
      flexWrap: 'wrap'
    },
    subjectIconContainer: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0'
    },
    subjectIcon: {
      fontSize: '40px',
      color: 'white'
    },
    subjectInfo: {
      flex: '1'
    },
    subjectName: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '10px'
    },
    subjectCode: {
      fontSize: '18px',
      color: '#6b7280',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: '#9ca3af',
      flexWrap: 'wrap'
    },
    breadcrumbItem: {
      padding: '6px 12px',
      background: '#f3f4f6',
      borderRadius: '6px'
    },
    currentBreadcrumb: {
      background: '#4f46e5',
      color: 'white'
    },
    statsBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      borderRadius: '12px',
      color: 'white',
      textAlign: 'center',
      minWidth: '120px'
    },
    statsNumber: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '5px'
    },
    statsLabel: {
      fontSize: '14px',
      opacity: '0.9'
    },
    lastRefreshed: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '10px',
      textAlign: 'right'
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f4f6',
              borderTop: '5px solid #4f46e5',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h3 style={{ color: '#6b7280' }}>Loading Study Materials...</h3>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SUBJECT NOT FOUND
  if (!subject) {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
            <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '10px' }}>Subject not found</h2>
            <p style={{ color: '#6b7280' }}>The requested subject could not be found in our database.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN RENDER
  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      
      <div style={styles.innerContainer}>
        {/* Header */}
        <div style={styles.headerButtons}>
          <button style={styles.backButton} onClick={handleBack}>
            <FaArrowLeft /> Back to Subjects
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button 
              style={{ ...styles.refreshButton, background: '#8b5cf6' }}
              onClick={() => navigate('/upload')}
            >
              <FaCloudUploadAlt /> Upload
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {/* Last Refreshed */}
        <div style={styles.lastRefreshed}>
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
        
        {/* Subject Header */}
        <div style={styles.subjectHeader}>
          <div style={styles.subjectIconContainer}>
            <div style={styles.subjectIcon}>📚</div>
          </div>
          
          <div style={styles.subjectInfo}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h1 style={styles.subjectName}>{subject.name}</h1>
                <div style={styles.subjectCode}>
                  <span>Code: <strong>{subject.code}</strong></span>
                  <span>⭐ <strong>{subject.credits} Credits</strong></span>
                  <span>📁 <strong>{materials.length} Materials</strong></span>
                  <span>🏷️ <strong>{subject.type || 'Theory'}</strong></span>
                </div>
                
                <div style={styles.breadcrumb}>
                  <span style={styles.breadcrumbItem}>
                    {courseInfo?.name || `Course ${courseId}`}
                  </span>
                  <span>→</span>
                  <span style={styles.breadcrumbItem}>
                    Year {yearId}
                  </span>
                  <span>→</span>
                  <span style={styles.breadcrumbItem}>
                    Semester {semId}
                  </span>
                  <span>→</span>
                  <span style={{ ...styles.breadcrumbItem, ...styles.currentBreadcrumb }}>
                    {subject.name}
                  </span>
                </div>
              </div>
              
              <div style={styles.statsBox}>
                <div style={styles.statsNumber}>{materials.length}</div>
                <div style={styles.statsLabel}>Total Files</div>
                <div style={{ ...styles.statsLabel, fontSize: '12px', marginTop: '5px' }}>
                  {materials.filter(m => m.isNew).length} New
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={`Search in ${subject.name} materials...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 50px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                background: '#f9fafb',
                transition: 'all 0.3s',
                outline: 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '18px'
            }}>
              <FaSearch />
            </div>
            {searchQuery && (
              <button
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaFilter /> Filter by Material Type
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {materialTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={{
                  padding: '12px 20px',
                  border: `2px solid ${selectedType === type.id ? type.color : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: selectedType === type.id ? `${type.color}15` : 'white',
                  color: selectedType === type.id ? type.color : '#4b5563',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ color: type.color }}>{type.icon}</span>
                {type.name}
                {type.id !== 'all' && (
                  <span style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {materialStats[type.id] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px', opacity: '0.5' }}>📭</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#6b7280', marginBottom: '10px' }}>
              No materials found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '30px' }}>
              {searchQuery 
                ? `No materials match "${searchQuery}"`
                : 'No approved materials available yet. Upload something!'}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                style={{
                  padding: '12px 30px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
                onClick={() => navigate('/upload')}
              >
                <FaCloudUploadAlt style={{ marginRight: '8px' }} />
                Upload Materials
              </button>
              {searchQuery && (
                <button
                  style={{
                    padding: '12px 30px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {selectedType === 'all' ? 'All Study Materials' : materialTypes.find(t => t.id === selectedType)?.name}
              </h3>
              <span style={{ 
                background: '#f3f4f6',
                padding: '5px 15px',
                borderRadius: '20px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '25px'
            }}>
              {filteredMaterials.map((material) => {
                const typeInfo = materialTypes.find(t => t.id === material.type) || materialTypes[1];
                
                return (
                  <div
                    key={material.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.4s ease',
                      background: 'white',
                      position: 'relative'
                    }}
                  >
                    {/* New Badge */}
                    {material.isNew && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ef4444',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                      }}>
                        NEW
                      </div>
                    )}
                    
                    {/* Header */}
                    <div style={{
                      padding: '18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #e5e7eb',
                      background: `${typeInfo?.color}10`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: typeInfo?.color, fontSize: '16px' }}>
                          {typeInfo?.icon}
                        </span>
                        <span style={{ color: typeInfo?.color, fontWeight: '600', fontSize: '14px' }}>
                          {typeInfo?.name}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontSize: '12px' }}>
                          <FaUser size={10} /> {material.user}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div style={{ padding: '25px' }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        {material.title}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                        minHeight: '60px'
                      }}>
                        {material.description}
                      </p>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginBottom: '20px',
                        background: '#f9fafb',
                        padding: '15px',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                          <FaClock color="#9ca3af" size={12} />
                          <span>{material.uploadDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                          <FaDownload color="#9ca3af" size={12} />
                          <span>{material.downloads} downloads</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                          <FaEye color="#9ca3af" size={12} />
                          <span>{material.views} views</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                          <FaStar color="#fbbf24" size={12} />
                          <span>{material.rating}/5</span>
                        </div>
                        
                        {/* ✅ RATING COMPONENT - ADDED HERE */}
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                          <Rating 
                            materialId={material.id} 
                            currentRating={material.rating}
                            onRate={(newRating) => {
                              console.log('New rating:', newRating);
                              setMaterials(prev =>
                                prev.map(m =>
                                  m.id === material.id
                                    ? { ...m, rating: newRating }
                                    : m
                                )
                              );
                            }}
                          />
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '15px',
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '13px',
                        color: '#9ca3af'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {getFileIcon(material.fileType)}
                          <span>{material.fileSize}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{
                      padding: '20px',
                      background: '#f9fafb',
                      borderTop: '1px solid #e5e7eb',
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <button
                        style={{
                          flex: '1',
                          padding: '12px',
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: '600',
                          color: '#4b5563',
                          fontSize: '14px'
                        }}
                        onClick={() => handlePreview(material)}
                      >
                        <FaEye size={14} /> Preview
                      </button>
                      
                      <button
                        style={{
                          flex: '2',
                          padding: '12px',
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: downloading[material.id] ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          opacity: downloading[material.id] ? 0.7 : 1
                        }}
                        onClick={() => handleDownload(material)}
                        disabled={downloading[material.id]}
                      >
                        {downloading[material.id] ? (
                          <>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={14} />
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;