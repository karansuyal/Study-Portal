import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllMaterials.css';
import { useNoteStats } from '../hooks/useNoteStats';

const AllMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Material Card Component
  const MaterialCard = ({ material }) => {
    const [downloading, setDownloading] = useState(false);
    const typeInfo = getMaterialTypeInfo(material.type);
    
    // useNoteStats hook - UNIVERSAL COUNTERS
    const stats = useNoteStats(material.id, {
      views: material.views || 0,
      downloads: material.downloads || 0
    });

    const handleView = () => {
      stats.incrementView();
      
      if (material.cloudinary_url) {
        console.log('📄 Opening:', material.cloudinary_url);
        
        const isPDF = material.cloudinary_url.includes('.pdf') || 
                      material.type === 'pdf' || 
                      material.file_name?.endsWith('.pdf');
        
        if (isPDF) {
          const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.cloudinary_url)}&embedded=true`;
          window.open(viewerUrl, '_blank');
        } else {
          window.open(material.cloudinary_url, '_blank');
        }
        return;
      }

      if (!material.file_name) {
        alert('No file to view');
        return;
      }

      const token = localStorage.getItem('study_portal_token');
      const testUrl = `https://study-portal-ill8.onrender.com/api/files/${material.file_name}`;
      
      fetch(testUrl, {
        method: 'HEAD',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      .then(response => {
        if (response.ok) {
          window.open(testUrl, '_blank');
        } else {
          alert('❌ File not found');
        }
      })
      .catch(() => alert('❌ File not found'));
    };

    const handleDownload = async () => {
      setDownloading(true);
      
      try {
        stats.incrementDownload();
        
        if (material.cloudinary_url) {
          let downloadUrl = material.cloudinary_url;
          
          if (downloadUrl.includes('/image/upload/')) {
            downloadUrl = downloadUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
          } else if (downloadUrl.includes('/raw/upload/')) {
            downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
          } else if (downloadUrl.includes('/video/upload/')) {
            downloadUrl = downloadUrl.replace('/video/upload/', '/video/upload/fl_attachment/');
          }

          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement("a");
          link.href = url;
          link.download = material.original_filename || material.file_name || `${material.title}.pdf`;
          
          document.body.appendChild(link);
          link.click();
          
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
        } else {
          const token = localStorage.getItem('study_portal_token');
          const response = await fetch(`https://study-portal-ill8.onrender.com/api/notes/${material.id}/download`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });

          if (!response.ok) throw new Error(`Download failed`);

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = material.file_name || `${material.title}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('❌ Download error:', error);
        alert(`Download failed: ${error.message}`);
      } finally {
        setDownloading(false);
      }
    };

    return (
      <div className="material-card">
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
            <span className="stat-number">{stats.views}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⬇️</span>
            <span className="stat-number">{stats.downloads}</span>
          </div>
        </div>

        <div className="material-actions">
          <button 
            className="view-btn"
            onClick={handleView}
            disabled={!material.file_name && !material.cloudinary_url}
          >
            👁️ View
          </button>
          <button 
            className="download-btn"
            onClick={handleDownload}
            disabled={downloading || (!material.file_name && !material.cloudinary_url)}
          >
            {downloading ? '⏳' : '⬇️ Download'}
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
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
};

export default AllMaterials;

