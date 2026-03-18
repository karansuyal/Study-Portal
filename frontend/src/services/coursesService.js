// src/services/coursesService.js
// Mock data for now
export const getCourses = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Data Structures', branch: 'CSE', semester: 3 },
        { id: 2, name: 'Digital Electronics', branch: 'ECE', semester: 2 },
        { id: 3, name: 'Thermodynamics', branch: 'Mechanical', semester: 3 },
      ]);
    }, 500);
  });
};