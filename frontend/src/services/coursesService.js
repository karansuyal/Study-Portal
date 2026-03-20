// src/services/coursesService.js
export const getCourses = async () => {
  
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