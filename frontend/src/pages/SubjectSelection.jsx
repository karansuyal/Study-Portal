import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaFileAlt, FaClock, FaStar, FaSearch } from 'react-icons/fa';
import { getSubjectsForSemester } from '../services/api';
import { coursesData, getSubjects } from '../data/coursesData';

const SubjectSelection = () => {
  const { courseId, yearId, semId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock courses data
  const coursesData = {
    1: { name: "B.Tech", icon: "💻" },
    2: { name: "BCA", icon: "📱" },
    3: { name: "BBA", icon: "📊" },
    4: { name: "MBA", icon: "🎓" },
    5: { name: "MCA", icon: "💼" }
  };

  // Mock subjects data based on semester
  const subjectsBySemester = {
    1: [],
    2: [],
    3: [],
    4: []  
  };

  useEffect(() => {
    fetchSubjects();
  }, [semId]);

  const fetchSubjects = async () => {
  try {
    setLoading(true);
    
    // Get course info
    const course = coursesData[courseId];
    if (!course) {
      console.error('Course not found');
      setLoading(false);
      return;
    }
    
    // Get subjects for this course, year and semester
    const semSubjects = getSubjects(courseId, yearId, semId);
    
    // If no subjects found for this semester, show message
    if (semSubjects.length === 0) {
      console.log(`No subjects found for Course ${courseId}, Year ${yearId}, Semester ${semId}`);
    }
    
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading subjects for Semester {semId}...</p>
      </div>
    );
  }

  const course = coursesData[courseId] || { name: 'Course', icon: '📚' };

  return (
    <div style={styles.container}>
      {/* Header with Back Button */}
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          <FaArrowLeft /> Back to Semesters
        </button>
        
        <div style={styles.pageHeader}>
          <div style={styles.courseSemesterInfo}>
            <h1 style={styles.title}>
              <span style={styles.courseIcon}>{course.icon}</span>
              {course.name} - Year {yearId}
            </h1>
            <p style={styles.subtitle}>Semester {semId} - Select Subject</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>
        <p style={styles.searchInfo}>
          Found {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Subjects Grid */}
      <div style={styles.subjectsGrid}>
        {filteredSubjects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>No subjects found!</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          filteredSubjects.map(subject => (
            <div
              key={subject.id}
              style={styles.subjectCard}
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div style={styles.subjectHeader}>
                <div style={styles.subjectIcon}>
                  <FaBook size={24} />
                </div>
                <div style={styles.subjectCodeBadge}>
                  {subject.code}
                </div>
              </div>

              <h3 style={styles.subjectName}>{subject.name}</h3>
              <p style={styles.subjectCredits}>{subject.credits} Credits</p>

              <div style={styles.subjectStats}>
                <span style={styles.statItem}>
                  <FaFileAlt /> {subject.materials} Materials
                </span>
                <span style={styles.statItem}>
                  <FaStar /> {subject.rating}/5
                </span>
              </div>

              <div style={styles.materialTypes}>
                <span style={styles.materialBadge}>Syllabus</span>
                <span style={styles.materialBadge}>Notes</span>
                <span style={styles.materialBadge}>PYQs</span>
                <span style={styles.materialBadge}>Lab Files</span>
              </div>

              <button style={styles.viewMaterialsButton}>
                View Study Materials →
              </button>
            </div>
          ))
        )}
      </div>

      {/* Semester Info */}
      <div style={styles.semesterInfo}>
        <h3>📚 Semester {semId} Information</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>📖</div>
            <div>
              <h4>Total Subjects</h4>
              <p>{subjects.length} Core Subjects</p>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🎯</div>
            <div>
              <h4>Credits</h4>
              <p>{subjects.reduce((sum, sub) => sum + sub.credits, 0)} Total Credits</p>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>📝</div>
            <div>
              <h4>Study Materials</h4>
              <p>{subjects.reduce((sum, sub) => sum + sub.materials, 0)}+ Files</p>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>⭐</div>
            <div>
              <h4>Average Rating</h4>
              <p>
                {(
                  subjects.reduce((sum, sub) => sum + sub.rating, 0) / subjects.length
                ).toFixed(1)} / 5
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  header: {
    marginBottom: '2rem'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s',
    marginBottom: '1.5rem',
    '&:hover': {
      background: '#4338ca',
      transform: 'translateX(-5px)'
    }
  },
  pageHeader: {
    background: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
  },
  courseSemesterInfo: {
    textAlign: 'center'
  },
  courseIcon: {
    fontSize: '2rem',
    marginRight: '0.5rem',
    verticalAlign: 'middle'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.1rem'
  },
  searchSection: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s',
    '&:focus': {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
    }
  },
  clearButton: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  searchInfo: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  subjectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  subjectCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '2px solid transparent',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      borderColor: '#4f46e5'
    }
  },
  subjectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  subjectIcon: {
    color: '#4f46e5'
  },
  subjectCodeBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  subjectName: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  subjectCredits: {
    color: '#6b7280',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  subjectStats: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1rem 0',
    fontSize: '0.8rem',
    color: '#666'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  materialTypes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    margin: '1rem 0'
  },
  materialBadge: {
    background: '#f3f4f6',
    color: '#4b5563',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.75rem'
  },
  viewMaterialsButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s',
    marginTop: '1rem',
    '&:hover': {
      background: 'linear-gradient(90deg, #4338ca, #6d28d9)'
    }
  },
  semesterInfo: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    }
  },
  infoIcon: {
    fontSize: '1.5rem'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  }
};

export default SubjectSelection;