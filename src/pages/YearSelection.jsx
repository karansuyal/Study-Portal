import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseYears as getCourseYearsFromConfig } from '../config/config';
import { getCourseYears as getCourseYearsFromAPI } from '../services/api';
import './YearSelection.css';

const YearSelection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const coursesColorData = {
    1: { name: "B.Tech", icon: "💻", color: "#4f46e5" },
    2: { name: "BCA", icon: "📱", color: "#ec4899" },
    3: { name: "BBA", icon: "📊", color: "#10b981" },
    4: { name: "MBA", icon: "🎓", color: "#f59e0b" },
    5: { name: "MCA", icon: "💼", color: "#8b5cf6" }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const courseData = getCourseById(courseId);
      
      if (!courseData) {
        throw new Error('Course not found');
      }

      setCourse(courseData);

      let yearsData;
      try {
        yearsData = await getCourseYearsFromAPI(courseId);
      } catch (apiError) {
        console.log('API failed, using config data');
        yearsData = getCourseYearsFromConfig(courseId);
      }

      const validYears = yearsData.filter(year => {
        const yearNum = typeof year === 'object' ? (year.id || year.year_id) : year;
        return yearNum <= courseData.duration;
      });

      const formattedYears = validYears.map(year => {
        const yearNum = typeof year === 'object' ? (year.id || year.year_id) : year;
        return {
          id: yearNum,
          name: year.name || `Year ${yearNum}`,
          subjects: year.subjects || (yearNum === 1 ? 8 : yearNum === 2 ? 7 : 6),
          description: `${courseData.name} Year ${yearNum} complete materials`,
          materials: year.materials || (200 + (yearNum * 50))
        };
      });

      setYears(formattedYears);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearClick = (yearId) => {
    navigate(`/course/${courseId}/year/${yearId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const courseColor = coursesColorData[courseId] || { color: '#4f46e5', icon: '📚' };

  if (loading) {
    return (
      <div className="year-loading-container">
        <div className="year-loading-spinner"></div>
        <p>Loading course information...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="year-error-container">
        <div className="year-error-icon">🔍</div>
        <h3>Course not found!</h3>
        <button onClick={handleBack} className="year-error-back-button">
          ← Back to Courses
        </button>
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div className="year-error-container">
        <div className="year-error-icon">📭</div>
        <h3>No Years Available</h3>
        <p>No academic years found for {course.name}.</p>
        <button onClick={handleBack} className="year-error-back-button">
          ← Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="year-container">
      {/* Compact Header */}
      <div className="year-compact-header">
        <button onClick={handleBack} className="year-compact-back-button">
          ← Back to Courses
        </button>
        <div className="year-compact-course-info">
          <span className="year-compact-course-icon">{courseColor.icon}</span>
          <span className="year-compact-course-name">{course.name}</span>
          <span className="year-compact-course-details">
            {course.duration} Years • {course.totalSemesters} Semesters
          </span>
        </div>
      </div>

      {/* Years Grid */}
      <div className="year-years-grid">
        {years.map((year) => (
          <div
            key={year.id}
            className="year-card"
            onClick={() => handleYearClick(year.id)}
          >
            <div 
              className="year-number-circle"
              style={{
                background: `linear-gradient(135deg, ${courseColor.color}40, ${courseColor.color}80)`,
                border: `3px solid ${courseColor.color}`
              }}
            >
              <span className="year-number-text">{year.id}</span>
            </div>
            <h3 className="year-name">{year.name}</h3>
            <p className="year-description">{year.description}</p>
            
            <div className="year-materials-preview">
              <span className="year-material-badge">📋 Syllabus</span>
              <span className="year-material-badge">📚 Notes</span>
              <span className="year-material-badge">📝 PYQs</span>
              {['1', '2', '5'].includes(courseId) ? (
                <span className="year-material-badge">🔬 Labs</span>
              ) : (
                <span className="year-material-badge">📊 Cases</span>
              )}
            </div>

            <div className="year-stats">
              <span className="year-stat">📚 {year.subjects} Subjects</span>
              <span className="year-stat">📄 {year.materials}+ Materials</span>
            </div>

            <button 
              className="year-select-button"
              style={{
                background: `linear-gradient(90deg, ${courseColor.color}, ${courseColor.color}DD)`,
                border: `2px solid ${courseColor.color}30`
              }}
            >
              Select Year {year.id} →
            </button>
          </div>
        ))}
      </div>

      {/* Simple Footer */}
      <div className="year-simple-footer">
        <p>
          <strong>{course.name}</strong> • {course.duration} Years • Complete study materials
        </p>
      </div>
    </div>
  );
};

export default YearSelection;