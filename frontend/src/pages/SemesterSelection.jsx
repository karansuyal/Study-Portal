import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSemestersForYear, getCourseById } from '../config/config';
import { getSubjects, coursesData } from '../data/coursesData';
import './SemesterSelection.css';

const SemesterSelection = () => {
  const { courseId, yearId } = useParams();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const coursesColorData = {
    1: { name: "B.Tech", icon: "💻", color: "#4f46e5" },
    2: { name: "BCA", icon: "📱", color: "#ec4899" },
    3: { name: "BBA", icon: "📊", color: "#10b981" },
    4: { name: "MBA", icon: "🎓", color: "#f59e0b" },
    5: { name: "MCA", icon: "💼", color: "#8b5cf6" }
  };

  useEffect(() => {
    fetchSemestersData();
  }, [courseId, yearId]);

  const getActualSemesterData = (courseId, yearId, semesterNumber) => {
    try {
      const subjects = getSubjects(courseId, yearId, semesterNumber);
      
      if (!subjects || subjects.length === 0) {
        return { subjects: 0, credits: 0 };
      }
      
      const totalCredits = subjects.reduce((sum, subject) => sum + (subject.credits || 0), 0);
      
      return {
        subjects: subjects.length,
        credits: totalCredits
      };
    } catch (error) {
      console.error(`Error getting data for sem ${semesterNumber}:`, error);
      return { subjects: 0, credits: 0 };
    }
  };

  const calculateSemesterNumbers = (year, courseData) => {
    const yearNum = parseInt(year);
    
    if (!courseData) return [];
    
    const baseSem = (yearNum - 1) * courseData.semestersPerYear;
    const semesterCount = courseData.semestersPerYear;
    const semesters = [];
    
    for (let i = 1; i <= semesterCount; i++) {
      const semesterNumber = baseSem + i;
      if (semesterNumber <= courseData.totalSemesters) {
        semesters.push({
          semesterNumber,
          name: `Semester ${semesterNumber}`,
          displayNumber: semesterNumber
        });
      }
    }
    
    return semesters;
  };

  const fetchSemestersData = async () => {
    try {
      const courseData = getCourseById(courseId);
      setCourse(courseData);

      if (!courseData) {
        setLoading(false);
        return;
      }

      const yearNum = parseInt(yearId);
      if (yearNum > courseData.duration) {
        console.warn(`Year ${yearNum} not available for ${courseData.name}`);
        setLoading(false);
        return;
      }

      let semestersData;

      try {
        semestersData = getSemestersForYear(courseId, yearNum);
        
        const semesterNumbers = calculateSemesterNumbers(yearId, courseData);
        
        semestersData = semestersData.map((sem, index) => {
          const semesterNumber = semesterNumbers[index]?.semesterNumber || sem.number;
          const actualData = getActualSemesterData(courseId, yearId, semesterNumber);
          
          return {
            ...sem,
            id: semesterNumber,
            name: semesterNumbers[index]?.name || sem.name,
            displayNumber: semesterNumbers[index]?.displayNumber || sem.number,
            subjects: actualData.subjects,
            credits: actualData.credits
          };
        });
        
      } catch (apiError) {
        console.log('Error fetching semesters from config, using fallback data');

        const semesterNumbers = calculateSemesterNumbers(yearId, courseData);
        
        semestersData = semesterNumbers.map((sem) => {
          const actualData = getActualSemesterData(courseId, yearId, sem.semesterNumber);
          
          return {
            id: sem.semesterNumber,
            name: sem.name,
            displayNumber: sem.displayNumber,
            subjects: actualData.subjects,
            credits: actualData.credits
          };
        });
      }

      if (semestersData.length === 0) {
        console.warn(`No semesters found for year ${yearId}. Using fallback.`);
        const semesterNumbers = calculateSemesterNumbers(yearId, courseData);
        
        semestersData = semesterNumbers.map((sem) => {
          const actualData = getActualSemesterData(courseId, yearId, sem.semesterNumber);
          
          return {
            id: sem.semesterNumber,
            name: sem.name,
            displayNumber: sem.displayNumber,
            subjects: actualData.subjects,
            credits: actualData.credits
          };
        });
      }

      setSemesters(semestersData);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterClick = (semesterId) => {
    navigate(`/course/${courseId}/year/${yearId}/sem/${semesterId}`);
  };

  const handleBack = () => {
    navigate(`/course/${courseId}`);
  };

  const filteredSemesters = semesters.filter(semester =>
    semester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `Semester ${semester.displayNumber}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const courseColor = coursesColorData[courseId] || { color: '#4f46e5', icon: '📚' };

  if (loading) {
    return (
      <div className="semester-loading-container">
        <div className="semester-loading-spinner"></div>
        <p>Loading semesters for Year {yearId}...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="semester-error-container">
        <div className="semester-error-icon">🔍</div>
        <h3>Course not found!</h3>
        <button onClick={handleBack} className="semester-error-back-button">
          ← Back to Courses
        </button>
      </div>
    );
  }

  const yearNum = parseInt(yearId);
  if (yearNum > course.duration) {
    return (
      <div className="semester-error-container">
        <div className="semester-error-icon">⚠️</div>
        <h3>Invalid Year for {course.name}</h3>
        <p>
          <strong>{course.name}</strong> has only <strong>{course.duration} years</strong> 
          ({course.totalSemesters} semesters).
        </p>
        <button onClick={handleBack} className="semester-error-back-button">
          ← Back to Years
        </button>
      </div>
    );
  }

  if (semesters.length === 0) {
    return (
      <div className="semester-error-container">
        <div className="semester-error-icon">📭</div>
        <h3>No Semesters Available</h3>
        <p>No semesters found for Year {yearId} of {course.name}.</p>
        <button onClick={handleBack} className="semester-error-back-button">
          ← Back to Years
        </button>
      </div>
    );
  }

  const getSemesterRange = () => {
    if (!course) return '';
    
    const yearNum = parseInt(yearId);
    const startSem = (yearNum - 1) * course.semestersPerYear + 1;
    const endSem = Math.min(yearNum * course.semestersPerYear, course.totalSemesters);
    
    if (startSem === endSem) {
      return `Semester ${startSem}`;
    }
    
    return `Semester ${startSem} to ${endSem}`;
  };

  const getYearTotals = () => {
    let totalSubjects = 0;
    let totalCredits = 0;
    
    semesters.forEach(sem => {
      totalSubjects += sem.subjects;
      totalCredits += sem.credits;
    });
    
    return { totalSubjects, totalCredits };
  };

  const { totalSubjects, totalCredits } = getYearTotals();

  return (
    <div className="semester-container">
      {/* Compact Header - Same as Year page */}
      <div className="semester-compact-header">
        <button onClick={handleBack} className="semester-compact-back-button">
          ← Back to Years
        </button>
        <div className="semester-compact-course-info">
          <span className="semester-compact-course-icon">{courseColor.icon}</span>
          <span className="semester-compact-course-name">{course.name} - Year {yearId}</span>
          <span className="semester-compact-course-details">
            {getSemesterRange()} • {semesters.length} Semesters
          </span>
        </div>
      </div>

      {/* Semesters Grid */}
      <div className="semester-semesters-grid">
        {filteredSemesters.length === 0 ? (
          <div className="semester-empty-state">
            <div className="semester-empty-icon">📚</div>
            <h3>No semesters found!</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          filteredSemesters.map((semester) => (
            <div
              key={semester.id}
              className="semester-card"
              onClick={() => handleSemesterClick(semester.id)}
            >
              <div 
                className="semester-number-circle"
                style={{
                  background: `linear-gradient(135deg, ${courseColor.color}40, ${courseColor.color}80)`,
                  border: `3px solid ${courseColor.color}`
                }}
              >
                <span className="semester-number-text">{semester.displayNumber}</span>
              </div>
              <h3 className="semester-name">{semester.name}</h3>
              <p className="semester-status">
                {semester.displayNumber <= course.totalSemesters ? 'Available' : 'Not Available'}
              </p>
              
              {/* Stats */}
              <div className="semester-stats">
                <span className="semester-stat">📚 {semester.subjects} Subjects</span>
                <span className="semester-stat">🎓 {semester.credits} Credits</span>
              </div>

              {/* Material Types Preview */}
              <div className="semester-materials-preview">
                <span className="semester-material-badge">📋 Syllabus</span>
                <span className="semester-material-badge">📚 Notes</span>
                <span className="semester-material-badge">📝 PYQs</span>
                {['1', '2', '5'].includes(courseId) ? (
                  <span className="semester-material-badge">🔬 Labs</span>
                ) : (
                  <span className="semester-material-badge">📊 Cases</span>
                )}
              </div>

              <button 
                className="semester-select-button"
                style={{
                  background: `linear-gradient(90deg, ${courseColor.color}, ${courseColor.color}DD)`,
                  border: `2px solid ${courseColor.color}30`
                }}
                disabled={semester.displayNumber > course.totalSemesters}
              >
                {semester.displayNumber <= course.totalSemesters 
                  ? 'View Subjects →' 
                  : 'Not Available'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Year Info Footer */}
      <div className="semester-simple-footer">
        <p>
          <strong>{course.name}</strong> • Year {yearId} • {getSemesterRange()} • 
          {totalSubjects} Subjects • {totalCredits} Credits
        </p>
      </div>
    </div>
  );
};

export default SemesterSelection;