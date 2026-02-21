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
        setMaterials(data.materials);
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

  const handleView = async (material) => {
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
      
      try {
        const response = await fetch(testUrl, {
          method: 'HEAD',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          await fetch(`https://study-portal-ill8.onrender.com/api/notes/${material.id}`, {
            method: 'GET',
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
      } catch (err) {
        console.log('❌ Failed:', testUrl);
      }
    }
    
    if (!fileFound) {
      alert('❌ File not found. It may have been moved or deleted.');
    }
  };

  const handleDownload = async (material) => {
    setDownloading(prev => ({ ...prev, [material.id]: true }));
    
    try {
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
      
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { ...m, downloads: (m.downloads || 0) + 1 } 
            : m
        )
      );
      
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
              {/* ✅ Title */}
              <h3 className="material-title">{material.title}</h3>
              
              {/* ✅ Details Column - Course, Person, Date, aur BADGE date ke niche */}
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
                
                {/* ✅ BADGE - Date ke niche same column mein */}
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

              {/* ✅ Stats - Views aur Downloads ek line mein */}
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

              {/* ✅ Actions */}
              <div className="material-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleView(material)}
                  disabled={!material.file_name}
                >
                  👁️ View
                </button>
                <button 
                  className="download-btn"
                  onClick={() => handleDownload(material)}
                  disabled={downloading[material.id] || !material.file_name}
                >
                  {downloading[material.id] ? '⏳' : '⬇️ Download'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllMaterials;
