// src/pages/SemesterSelection.js
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

  const calculateTotalCredits = (subjects) => {
    if (!subjects || !Array.isArray(subjects)) return 0;
    return subjects.reduce((total, subject) => total + (subject.credits || 0), 0);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading semesters...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <h3>Course not found!</h3>
        <button onClick={handleBack} className="back-button">
          ← Back to Courses
        </button>
      </div>
    );
  }

  const yearNum = parseInt(yearId);
  if (yearNum > course.duration) {
    return (
      <div className="error-container">
        <h3>Invalid Year for {course.name}</h3>
        <p>
          <strong>{course.name}</strong> has only <strong>{course.duration} years</strong> 
          ({course.totalSemesters} semesters).
        </p>
        <button onClick={handleBack} className="back-button">
          ← Back to Years
        </button>
      </div>
    );
  }

  if (semesters.length === 0) {
    return (
      <div className="error-container">
        <h3>No Semesters Available</h3>
        <p>No semesters found for Year {yearId} of {course.name}.</p>
        <button onClick={handleBack} className="back-button">
          ← Back to Years
        </button>
      </div>
    );
  }

  const { totalSubjects, totalCredits } = getYearTotals();

  return (
    <div className="semester-container">
      <div className="semester-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Years
        </button>
        <div className="page-header">
          <h1 className="title">
            <span className="course-icon">{course.icon}</span>
            {course.name} - Year {yearId}
          </h1>
          <p className="subtitle">
            {course.description} • Select your semester
          </p>
        </div>
      </div>

      <div className="course-info-banner">
        <div className="course-info-item">
          <span className="info-icon">📅</span>
          <div>
            <p className="info-label">Total Years</p>
            <p className="info-value">{course.duration}</p>
          </div>
        </div>
        <div className="course-info-item">
          <span className="info-icon">📚</span>
          <div>
            <p className="info-label">Total Semesters</p>
            <p className="info-value">{course.totalSemesters}</p>
          </div>
        </div>
        <div className="course-info-item">
          <span className="info-icon">🎯</span>
          <div>
            <p className="info-label">Current Year</p>
            <p className="info-value">{yearId} of {course.duration}</p>
          </div>
        </div>
      </div>

      <div className="semesters-grid">
        {semesters.map((semester) => (
          <div
            key={semester.id}
            className="semester-card"
            onClick={() => handleSemesterClick(semester.id)}
          >
            <div className="semester-header">
              <div className="semester-number">{semester.displayNumber}</div>
              <div>
                <h3 className="semester-name">{semester.name}</h3>
                <p className="semester-status">
                  {semester.displayNumber <= course.totalSemesters ? 'Available' : 'Not Available'}
                </p>
              </div>
            </div>

            <div className="semester-info">
              <div className="info-item">
                <span className="info-label">Subjects:</span>
                <span className="info-value">{semester.subjects}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Credits:</span>
                <span className="info-value">{semester.credits}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">
                  {['4', '5'].includes(courseId) ? 'Master\'s' : 'Bachelor\'s'}
                </span>
              </div>
            </div>

            <div className="materials-list">
              <span className="material-badge">Syllabus</span>
              <span className="material-badge">Notes</span>
              <span className="material-badge">PYQs</span>
              {['1', '2', '5'].includes(courseId) ? (
                <span className="material-badge">Lab Files</span>
              ) : (
                <span className="material-badge">Case Studies</span>
              )}
            </div>

            <button 
              className="view-button"
              disabled={semester.displayNumber > course.totalSemesters}
            >
              {semester.displayNumber <= course.totalSemesters 
                ? 'View Subjects →' 
                : 'Not Available'}
            </button>
          </div>
        ))}
      </div>

      <div className="year-info">
        <h3>📚 Year {yearId} Information</h3>
        <p>
          Semesters: {getSemesterRange()} • 
          Total Credits: {totalCredits} • 
          Total Subjects: {totalSubjects}
        </p>
        <div className="semester-range">
          <p><strong>Course Type:</strong> 
            {['4', '5'].includes(courseId) ? ' Master\'s Program' : ' Bachelor\'s Program'}
          </p>
          <p><strong>Duration:</strong> {course.duration} Years ({course.totalSemesters} Semesters)</p>
          <p><strong>Semesters per Year:</strong> {course.semestersPerYear}</p>
        </div>
      </div>
    </div>
  );
};

export default SemesterSelection;
