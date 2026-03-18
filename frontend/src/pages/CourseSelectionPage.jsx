import React from 'react';
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom';

const courses = [
  { 
    id: 1, 
    name: "B.Tech", 
    icon: "💻", 
    code: "BTECH",
    branch: "Engineering",
    duration: "4 Years",
    description: "Bachelor of Technology",
    totalSubjects: 40,
    popular: true
  },
  { 
    id: 2, 
    name: "BCA", 
    icon: "📱", 
    code: "BCA",
    branch: "Computer Applications",
    duration: "3 Years",
    description: "Bachelor of Computer Applications",
    totalSubjects: 30
  },
  { 
    id: 3, 
    name: "BBA", 
    icon: "📊", 
    code: "BBA",
    branch: "Business Administration",
    duration: "3 Years",
    description: "Bachelor of Business Administration",
    totalSubjects: 32
  },
  { 
    id: 4, 
    name: "MBA", 
    icon: "🎓", 
    code: "MBA",
    branch: "Business Administration",
    duration: "2 Years",
    description: "Master of Business Administration",
    totalSubjects: 20
  },
  { 
    id: 5, 
    name: "MCA", 
    icon: "💼", 
    code: "MCA",
    branch: "Computer Applications",
    duration: "3 Years",
    description: "Master of Computer Applications",
    totalSubjects: 28
  }
];

const CourseSelectionPage = () => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📚 Study Portal</h1>
        <p>Select your course to access study materials</p>
      </header>
      
      <div style={styles.coursesGrid}>
        {courses.map((course) => (
          <div 
            key={course.id} 
            style={styles.courseItem}
            onClick={() => handleCourseClick(course.id)}
          >
            <CourseCard 
              course={{
                ...course,
                notes: 50,
                pyqs: 30,
                semester: "All",
                onPreview: () => console.log("Preview", course.name)
              }}
            />
          </div>
        ))}
      </div>
      
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>5000+</h3>
          <p>Study Materials</p>
        </div>
        <div style={styles.statCard}>
          <h3>100+</h3>
          <p>Subjects Covered</p>
        </div>
        <div style={styles.statCard}>
          <h3>24/7</h3>
          <p>Access Available</p>
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem'
  },
  courseItem: {
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '15px',
    textAlign: 'center',
    minWidth: '150px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
  }
};

export default CourseSelectionPage;