import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllMaterials.css';

const AllMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllMaterials();
  }, []);

  const fetchAllMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://study-portal-ill8.onrender.com/api/materials');
      const data = await response.json();
      
      if (data.success) {
        const transformedMaterials = data.materials.map(material => ({
          ...material,
          cloudinary_url: material.cloudinary_url || null,
          file_url: material.cloudinary_url || material.file_url
        }));
        
        setMaterials(transformedMaterials);
        setError(null);
      } else {
        setError('Failed to load materials');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED VIEW FUNCTION - PDF Google Viewer mein open hoga, download nahi
  const handleView = (material) => {
    if (material.cloudinary_url) {
      console.log('📄 Opening:', material.cloudinary_url);
      
      // Views increment in background
      const token = localStorage.getItem('study_portal_token');
      fetch(`https://study-portal-ill8.onrender.com/api/notes/${material.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }).catch(() => {});
      
      // Check if it's PDF
      const isPDF = material.cloudinary_url.includes('.pdf') || 
                    material.type === 'pdf' || 
                    material.file_name?.endsWith('.pdf');
      
      if (isPDF) {
        // ✅ PDF ke liye Google PDF Viewer (100% reliable)
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.cloudinary_url)}&embedded=true`;
        window.open(viewerUrl, '_blank');
      } else {
        // ✅ Images ke liye direct open
        window.open(material.cloudinary_url, '_blank');
      }
      
      // Update view count
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { ...m, views: (m.views || 0) + 1 } 
            : m
        )
      );
      
      return;
    }

    // Fallback for non-Cloudinary files
    if (!material.file_name) {
      alert('No file to view');
      return;
    }

    const token = localStorage.getItem('study_portal_token');
    
    const possiblePaths = [
      material.file_name,
      `${material.course}/${material.file_name}`,
      material.file_name.includes('/') ? material.file_name : `${material.course}/${material.file_name}`
    ];

    let fileFound = false;
    
    for (const path of possiblePaths) {
      if (fileFound) break;
      
      const testUrl = `https://study-portal-ill8.onrender.com/api/files/${path}`;
      
      fetch(testUrl, {
        method: 'HEAD',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      .then(response => {
        if (response.ok) {
          fetch(`https://study-portal-ill8.onrender.com/api/notes/${material.id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          
          setMaterials(prevMaterials => 
            prevMaterials.map(m => 
              m.id === material.id 
                ? { ...m, views: (m.views || 0) + 1 } 
                : m
            )
          );
          
          window.open(testUrl, '_blank');
          fileFound = true;
        }
      })
      .catch(() => {});
    }
    
    if (!fileFound) {
      alert('❌ File not found. It may have been moved or deleted.');
    }
  };

  // ✅ FIXED DOWNLOAD FUNCTION - Force download with proper filename
  // ✅ FIXED DOWNLOAD FUNCTION - Force download with proper filename
const handleDownload = async (material) => {
  setDownloading(prev => ({ ...prev, [material.id]: true }));
  
  try {
    if (material.cloudinary_url) {
      console.log('📥 Downloading from Cloudinary:', material.cloudinary_url);
      
      // ✅ Correct fl_attachment URL for Cloudinary
      const downloadUrl = material.cloudinary_url.replace(
        "/image/upload/",
        "/image/upload/fl_attachment/"
      );

      // ✅ Better filename handling
      let fileName = material.original_filename || material.file_name || material.title || 'document';
      
      // Add extension if missing
      if (!fileName.includes('.')) {
        const isPDF = material.cloudinary_url.includes('.pdf') || 
                      material.type === 'pdf' || 
                      material.file_name?.endsWith('.pdf');
        fileName += isPDF ? '.pdf' : '.jpg';
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ Update download count
      setMaterials(prevMaterials => {
        const updatedMaterials = prevMaterials.map(item => 
          item.id === material.id 
            ? { ...item, downloads: (item.downloads || 0) + 1 } 
            : item
        );
        return [...updatedMaterials];
      });

      setDownloading(prev => ({ ...prev, [material.id]: false }));
      return;
    }
    
    // Fallback to API method (same as before)
    const token = localStorage.getItem('study_portal_token');
    
    if (!token) {
      const shouldLogin = window.confirm('Please login first to download materials. Go to login page?');
      if (shouldLogin) {
        navigate('/login');
      }
      return;
    }
    
    const downloadUrl = `https://study-portal-ill8.onrender.com/api/notes/${material.id}/download`;
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    
    // Update download count
    setMaterials(prevMaterials => {
      const updatedMaterials = prevMaterials.map(item => 
        item.id === material.id 
          ? { ...item, downloads: (item.downloads || 0) + 1 } 
          : item
      );
      return [...updatedMaterials];
    });
    
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
    setDownloading(prev => ({ ...prev, [material.id]: false }));
  }
};

  const getMaterialTypeInfo = (type) => {
    switch (type?.toLowerCase()) {
      case 'notes':
        return { icon: '📄', label: 'NOTES', bg: '#dbeafe', color: '#1d4ed8' };
      case 'pyq':
        return { icon: '📝', label: 'PYQ', bg: '#fef3c7', color: '#92400e' };
      case 'syllabus':
        return { icon: '📋', label: 'SYLLABUS', bg: '#dcfce7', color: '#166534' };
      case 'imp_questions':
        return { icon: '❓', label: 'IMP QUES', bg: '#f3e8ff', color: '#6b21a8' };
      default:
        return { icon: '📄', label: 'MATERIAL', bg: '#f1f5f9', color: '#475569' };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchAllMaterials} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No Materials Found</h3>
        <p>There are no study materials available yet.</p>
      </div>
    );
  }

  return (
    <div className="all-materials-container">
      <div className="all-materials-header">
        <h1>📚 All Study Materials</h1>
        <p>Browse through all available notes, PYQs, and syllabus</p>
      </div>

      <div className="materials-grid">
        {materials.map((material) => {
          const typeInfo = getMaterialTypeInfo(material.type);
          
          return (
            <div key={material.id} className="material-card">
              <h3 className="material-title">{material.title}</h3>
              
              <div className="material-details">
                <div className="detail-item">
                  <span className="detail-icon">📚</span>
                  <span className="detail-text">{material.course || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <span className="detail-text">{material.user_name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">
                    {material.uploaded_at ? new Date(material.uploaded_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="detail-item badge-detail-item">
                  <span className="detail-icon">{typeInfo.icon}</span>
                  <span 
                    className="detail-badge"
                    style={{ 
                      background: typeInfo.bg,
                      color: typeInfo.color
                    }}
                  >
                    {typeInfo.label}
                  </span>
                </div>
              </div>

              <div className="material-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-number">{material.views || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⬇️</span>
                  <span className="stat-number">{material.downloads || 0}</span>
                </div>
              </div>

              {/* ✅ Actions - View and Download */}
              <div className="material-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleView(material)}
                  disabled={!material.file_name && !material.cloudinary_url}
                >
                  👁️ View
                </button>
                <button 
                  className="download-btn"
                  onClick={() => handleDownload(material)}
                  disabled={downloading[material.id] || (!material.file_name && !material.cloudinary_url)}
                >
                  {downloading[material.id] ? '⏳' : '⬇️ Download'}
                </button>
              </div>

              {material.cloudinary_url && (
                <div className="cloudinary-badge" style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '5px',
                  textAlign: 'right'
                }}>
                  ☁️ Cloudinary
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllMaterials;