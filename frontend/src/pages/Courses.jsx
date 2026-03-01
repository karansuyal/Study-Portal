// import React, { useState, useEffect } from 'react';
// import CourseCard from '../components/CourseCard';

// const Courses = () => {
//   const [courses, setCourses] = useState([]);
//   const [filteredCourses, setFilteredCourses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedBranch, setSelectedBranch] = useState('All');
//   const [selectedSemester, setSelectedSemester] = useState('All');

//   const branches = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'MBA'];
//   const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

//   useEffect(() => {
//     // Mock data
//     const mockCourses = [
//       // { id: 1, name: 'Data Structures', branch: 'CSE', semester: 3, notes: 25, pyqs: 40 },
//       // { id: 2, name: 'Algorithms', branch: 'CSE', semester: 4, notes: 30, pyqs: 35 },
//       // { id: 3, name: 'Database Systems', branch: 'CSE', semester: 4, notes: 22, pyqs: 30 },
//       // { id: 4, name: 'Digital Electronics', branch: 'ECE', semester: 2, notes: 18, pyqs: 35 },
//       // { id: 5, name: 'Microprocessors', branch: 'ECE', semester: 3, notes: 20, pyqs: 28 },
//       // { id: 6, name: 'Thermodynamics', branch: 'Mechanical', semester: 3, notes: 22, pyqs: 30 },
//       // { id: 7, name: 'Fluid Mechanics', branch: 'Mechanical', semester: 4, notes: 19, pyqs: 25 },
//       // { id: 8, name: 'Structural Analysis', branch: 'Civil', semester: 3, notes: 15, pyqs: 20 },
//       // { id: 9, name: 'Circuit Theory', branch: 'EEE', semester: 2, notes: 20, pyqs: 28 },
//       // { id: 10, name: 'Power Systems', branch: 'EEE', semester: 4, notes: 17, pyqs: 22 },
//       // { id: 11, name: 'Marketing Management', branch: 'MBA', semester: 1, notes: 25, pyqs: 30 },
//       // { id: 12, name: 'Financial Accounting', branch: 'MBA', semester: 2, notes: 20, pyqs: 25 },
//     ];

//     setCourses(mockCourses);
//     setFilteredCourses(mockCourses);
//   }, []);

//   useEffect(() => {
//     let filtered = courses;

//     // Filter by search term
//     if (searchTerm) {
//       filtered = filtered.filter(course =>
//         course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         course.branch.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Filter by branch
//     if (selectedBranch !== 'All') {
//       filtered = filtered.filter(course => course.branch === selectedBranch);
//     }

//     // Filter by semester
//     if (selectedSemester !== 'All') {
//       filtered = filtered.filter(course => course.semester === parseInt(selectedSemester));
//     }

//     setFilteredCourses(filtered);
//   }, [searchTerm, selectedBranch, selectedSemester, courses]);

//   const styles = {
//     container: {
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '2rem 1rem'
//     },
//     header: {
//       textAlign: 'center',
//       marginBottom: '2rem'
//     },
//     title: {
//       fontSize: '2.5rem',
//       color: '#1f2937',
//       marginBottom: '0.5rem'
//     },
//     subtitle: {
//       color: '#6b7280',
//       fontSize: '1.1rem'
//     },
//     filters: {
//       background: 'white',
//       padding: '1.5rem',
//       borderRadius: '10px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       marginBottom: '2rem'
//     },
//     filterGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(1, 1fr)',
//       gap: '1rem',
//       '@media (min-width: 768px)': {
//         gridTemplateColumns: 'repeat(3, 1fr)'
//       }
//     },
//     filterGroup: {
//       label: {
//         display: 'block',
//         marginBottom: '0.5rem',
//         fontWeight: '500',
//         color: '#374151'
//       },
//       select: {
//         width: '100%',
//         padding: '0.75rem',
//         borderRadius: '8px',
//         border: '1px solid #d1d5db',
//         fontSize: '1rem',
//         outline: 'none',
//         '&:focus': {
//           borderColor: '#4f46e5'
//         }
//       },
//       input: {
//         width: '100%',
//         padding: '0.75rem',
//         borderRadius: '8px',
//         border: '1px solid #d1d5db',
//         fontSize: '1rem',
//         outline: 'none',
//         '&:focus': {
//           borderColor: '#4f46e5'
//         }
//       }
//     },
//     resetButton: {
//       background: '#ef4444',
//       color: 'white',
//       border: 'none',
//       padding: '0.75rem 1.5rem',
//       borderRadius: '8px',
//       fontWeight: '500',
//       cursor: 'pointer',
//       marginTop: '1rem',
//       '&:hover': {
//         background: '#dc2626'
//       }
//     },
//     results: {
//       marginTop: '1rem',
//       color: '#6b7280'
//     },
//     coursesGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(1, 1fr)',
//       gap: '1.5rem',
//       '@media (min-width: 640px)': {
//         gridTemplateColumns: 'repeat(2, 1fr)'
//       },
//       '@media (min-width: 1024px)': {
//         gridTemplateColumns: 'repeat(3, 1fr)'
//       }
//     },
//     noResults: {
//       textAlign: 'center',
//       padding: '3rem',
//       color: '#6b7280',
//       fontSize: '1.1rem'
//     },
//     branchTags: {
//       display: 'flex',
//       flexWrap: 'wrap',
//       gap: '0.5rem',
//       marginTop: '1rem'
//     },
//     branchTag: {
//       padding: '0.5rem 1rem',
//       background: '#e0e7ff',
//       color: '#4f46e5',
//       borderRadius: '20px',
//       fontSize: '0.9rem',
//       cursor: 'pointer',
//       transition: 'all 0.3s',
//       '&:hover': {
//         background: '#c7d2fe'
//       }
//     },
//     activeBranchTag: {
//       background: '#4f46e5',
//       color: 'white'
//     }
//   };

//   const handleReset = () => {
//     setSearchTerm('');
//     setSelectedBranch('All');
//     setSelectedSemester('All');
//   };

//   return (
//     <div style={styles.container}>
//       <header style={styles.header}>
//         <h1 style={styles.title}>All Courses</h1>
//         <p style={styles.subtitle}>Browse through all available courses and study materials</p>
//       </header>

//       {/* Filters */}
//       <div style={styles.filters}>
//         <div style={styles.filterGrid}>
//           {/* Search */}
//           <div>
//             <label style={styles.filterGroup.label}>Search Courses</label>
//             <input
//               type="text"
//               placeholder="Search by course name or branch..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={styles.filterGroup.input}
//             />
//           </div>

//           {/* Branch Filter */}
//           <div>
//             <label style={styles.filterGroup.label}>Branch</label>
//             <select
//               value={selectedBranch}
//               onChange={(e) => setSelectedBranch(e.target.value)}
//               style={styles.filterGroup.select}
//             >
//               {branches.map(branch => (
//                 <option key={branch} value={branch}>{branch}</option>
//               ))}
//             </select>
//           </div>

//           {/* Semester Filter */}
//           <div>
//             <label style={styles.filterGroup.label}>Semester</label>
//             <select
//               value={selectedSemester}
//               onChange={(e) => setSelectedSemester(e.target.value)}
//               style={styles.filterGroup.select}
//             >
//               {semesters.map(sem => (
//                 <option key={sem} value={sem}>{sem}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Quick Branch Filters */}
//         <div style={styles.branchTags}>
//           {branches.filter(b => b !== 'All').map(branch => (
//             <span
//               key={branch}
//               style={{
//                 ...styles.branchTag,
//                 ...(selectedBranch === branch ? styles.activeBranchTag : {})
//               }}
//               onClick={() => setSelectedBranch(branch)}
//             >
//               {branch}
//             </span>
//           ))}
//         </div>

//         {/* Reset Button */}
//         <button onClick={handleReset} style={styles.resetButton}>
//           Reset Filters
//         </button>

//         <div style={styles.results}>
//           Showing {filteredCourses.length} of {courses.length} courses
//         </div>
//       </div>

//       {/* Courses Grid */}
//       {filteredCourses.length === 0 ? (
//         <div style={styles.noResults}>
//           <h3>No courses found</h3>
//           <p>Try changing your search criteria</p>
//         </div>
//       ) : (
//         <div style={styles.coursesGrid}>
//           {filteredCourses.map(course => (
//             <CourseCard key={course.id} course={course} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Courses;