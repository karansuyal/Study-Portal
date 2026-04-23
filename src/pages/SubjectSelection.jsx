import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaFileAlt, FaStar, FaClock } from 'react-icons/fa';
import { getSubjects } from '../data/coursesData';
import './SubjectSelection.css';

const SubjectSelection = () => {
  const { courseId, yearId, semId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const coursesData = {
    1: { name: "B.Tech", icon: "💻", duration: 4, totalSemesters: 8, color: "#4f46e5" },
    2: { name: "BCA", icon: "📱", duration: 3, totalSemesters: 6, color: "#ec4899" },
    3: { name: "BBA", icon: "📊", duration: 3, totalSemesters: 6, color: "#10b981" },
    4: { name: "MBA", icon: "🎓", duration: 2, totalSemesters: 4, color: "#f59e0b" },
    5: { name: "MCA", icon: "💼", duration: 2, totalSemesters: 4, color: "#8b5cf6" }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const semSubjects = getSubjects(parseInt(courseId), parseInt(yearId), parseInt(semId));
      setSubjects(semSubjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/course/${courseId}/year/${yearId}`);
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/course/${courseId}/year/${yearId}/sem/${semId}/subject/${subjectId}`);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const course = coursesData[courseId] || { name: 'Course', icon: '📚', color: '#4f46e5', duration: 4 };

  if (loading) {
    return (
      <div className="subject-loading-container">
        <div className="subject-loading-spinner"></div>
        <p>Loading subjects for Semester {semId}...</p>
      </div>
    );
  }

  return (
    <div className="subject-container">
      {/* Compact Header - Same as Year page */}
      <div className="subject-compact-header">
        <button onClick={handleBack} className="subject-compact-back-button">
          ← Back to Semesters
        </button>
        <div className="subject-compact-course-info">
          <span className="subject-compact-course-icon">{course.icon}</span>
          <span className="subject-compact-course-name">{course.name} - Year {yearId}</span>
          <span className="subject-compact-course-details">
            Semester {semId} • {subjects.length} Subjects
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="subject-search-section">
        <div className="subject-search-container">
          <span className="subject-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="subject-search-input"
          />
          {searchQuery && (
            <button className="subject-clear-button" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="subject-subjects-grid">
        {filteredSubjects.length === 0 ? (
          <div className="subject-empty-state">
            <div className="subject-empty-icon">📚</div>
            <h3>No subjects found!</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div 
                className="subject-number-circle"
                style={{
                  background: `linear-gradient(135deg, ${course.color}40, ${course.color}80)`,
                  border: `3px solid ${course.color}`
                }}
              >
                <span className="subject-code">{subject.code}</span>
              </div>
              <h3 className="subject-name">{subject.name}</h3>
              <p className="subject-credits">{subject.credits} Credits</p>
              
              {/* Material Types Preview */}
              <div className="subject-materials-preview">
                <span className="subject-material-badge">📋 Syllabus</span>
                <span className="subject-material-badge">📚 Notes</span>
                <span className="subject-material-badge">📝 PYQs</span>
                <span className="subject-material-badge">🔬 Labs</span>
              </div>

              {/* Stats */}
              <div className="subject-stats">
                <span className="subject-stat">📄 {subject.materials || 15}+ Materials</span>
                <span className="subject-stat">⭐ {subject.rating || 4.5}/5</span>
              </div>

              <button 
                className="subject-select-button"
                style={{
                  background: `linear-gradient(90deg, ${course.color}, ${course.color}DD)`,
                  border: `2px solid ${course.color}30`
                }}
              >
                View Materials →
              </button>
            </div>
          ))
        )}
      </div>

      {/* Semester Info Footer */}
      <div className="subject-simple-footer">
        <p>
          <strong>{course.name}</strong> • Year {yearId} • Semester {semId} • {subjects.length} Subjects • Complete study materials
        </p>
      </div>
    </div>
  );
};

export default SubjectSelection;