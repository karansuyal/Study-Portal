// src/config/config.js

const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://study-portal-ill8.onrender.com',
  API_TIMEOUT: 10000, // 10 seconds
  
  // App Configuration
  APP_NAME: 'Study Portal',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Complete hierarchical study material system',
  
  // 📚 HIERARCHICAL COURSES CONFIGURATION
  COURSES: {
    '1': {
      id: 1,
      name: 'B.Tech',
      fullName: 'Bachelor of Technology',
      icon: '💻',
      duration: 4, // Years
      semestersPerYear: 2,
      totalSemesters: 8,
      color: '#3B82F6', // Blue
      description: 'Engineering undergraduate program',
      branches: ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT']
    },
    '2': {
      id: 2,
      name: 'BCA',
      fullName: 'Bachelor of Computer Applications',
      icon: '📱',
      duration: 3,
      semestersPerYear: 2,
      totalSemesters: 6,
      color: '#10B981', // Green
      description: 'Computer applications undergraduate program',
      branches: ['Computer Applications']
    },
    '3': {
      id: 3,
      name: 'BBA',
      fullName: 'Bachelor of Business Administration',
      icon: '📊',
      duration: 3,
      semestersPerYear: 2,
      totalSemesters: 6,
      color: '#8B5CF6', // Purple
      description: 'Business administration undergraduate program',
      branches: ['General', 'Marketing', 'Finance', 'HR']
    },
    '4': {
      id: 4,
      name: 'MBA',
      fullName: 'Master of Business Administration',
      icon: '🎓',
      duration: 2,
      semestersPerYear: 2,
      totalSemesters: 4,
      color: '#EF4444', // Red
      description: 'Business administration postgraduate program',
      branches: ['General', 'Marketing', 'Finance', 'HR', 'Operations']
    },
    '5': {
      id: 5,
      name: 'MCA',
      fullName: 'Master of Computer Applications',
      icon: '💼',
      duration: 2, // ✅ CORRECTED: MCA is 2 years, not 3
      semestersPerYear: 2,
      totalSemesters: 4, // ✅ CORRECTED: 2 years × 2 semesters = 4 semesters
      color: '#F59E0B', // Orange
      description: 'Computer applications postgraduate program',
      branches: ['Computer Applications']
    }
  },

  // 📅 YEARS CONFIGURATION
  YEARS: {
    '1': { name: 'First Year', shortName: 'Year 1', level: 'Freshman' },
    '2': { name: 'Second Year', shortName: 'Year 2', level: 'Sophomore' },
    '3': { name: 'Third Year', shortName: 'Year 3', level: 'Junior' },
    '4': { name: 'Fourth Year', shortName: 'Year 4', level: 'Senior' }
  },

  // 📘 SEMESTERS CONFIGURATION
  SEMESTERS: {
    '1': { name: 'Semester 1', number: 1, subjects: 6, credits: 24 },
    '2': { name: 'Semester 2', number: 2, subjects: 6, credits: 24 },
    '3': { name: 'Semester 3', number: 3, subjects: 7, credits: 28 },
    '4': { name: 'Semester 4', number: 4, subjects: 7, credits: 28 },
    '5': { name: 'Semester 5', number: 5, subjects: 6, credits: 24 },
    '6': { name: 'Semester 6', number: 6, subjects: 6, credits: 24 },
    '7': { name: 'Semester 7', number: 7, subjects: 5, credits: 20 },
    '8': { name: 'Semester 8', number: 8, subjects: 5, credits: 20 }
  },

  // 📖 SUBJECT CATEGORIES
  SUBJECT_CATEGORIES: {
    'core': { name: 'Core Subjects', color: '#3B82F6' },
    'elective': { name: 'Elective Subjects', color: '#10B981' },
    'lab': { name: 'Lab Subjects', color: '#8B5CF6' },
    'project': { name: 'Project Work', color: '#EF4444' },
    'general': { name: 'General Subjects', color: '#6B7280' }
  },

  // 📄 MATERIAL TYPES CONFIGURATION
  MATERIAL_TYPES: {
    'syllabus': {
      name: 'Syllabus',
      icon: '📋',
      color: '#3B82F6',
      extensions: ['pdf', 'doc', 'docx'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    'notes': {
      name: 'Notes',
      icon: '📝',
      color: '#10B981',
      extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    'pyq': {
      name: 'Previous Year Questions',
      icon: '📚',
      color: '#8B5CF6',
      extensions: ['pdf', 'doc', 'docx'],
      maxSize: 8 * 1024 * 1024 // 8MB
    },
    'important': {
      name: 'Important Questions',
      icon: '❓',
      color: '#EF4444',
      extensions: ['pdf', 'doc', 'docx'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    'lab': {
      name: 'Lab Manuals',
      icon: '🔬',
      color: '#F59E0B',
      extensions: ['pdf', 'doc', 'docx', 'zip', 'rar'],
      maxSize: 20 * 1024 * 1024 // 20MB
    },
    'assignment': {
      name: 'Assignments',
      icon: '📄',
      color: '#EC4899',
      extensions: ['pdf', 'doc', 'docx'],
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    'presentation': {
      name: 'Presentations',
      icon: '📊',
      color: '#14B8A6',
      extensions: ['ppt', 'pptx', 'pdf'],
      maxSize: 15 * 1024 * 1024 // 15MB
    }
  },

  // 📊 STATISTICS DEFAULT VALUES
  STATS_DEFAULTS: {
    totalNotes: 5000,
    totalPYQs: 2000,
    totalCourses: 5,
    totalDownloads: 15000,
    totalSubjects: 150
  },

  // ⚙️ UPLOAD CONFIGURATION
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip', 'rar'],
    MAX_FILES_PER_UPLOAD: 10,
    ACCEPTED_MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'application/zip',
      'application/x-rar-compressed'
    ]
  },

  // 📱 PAGINATION
  PAGINATION: {
    ITEMS_PER_PAGE: 12,
    COURSES_PER_PAGE: 6,
    MATERIALS_PER_PAGE: 20,
    VISIBLE_PAGES: 5
  },

  // 🔍 SEARCH CONFIGURATION
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_TIME: 300, // ms
    MAX_SUGGESTIONS: 8,
    RECENT_SEARCHES_LIMIT: 5
  },

  // 🎨 THEME COLORS
  COLORS: {
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    secondary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    light: '#f8fafc',
    dark: '#1f2937',
    gray: '#6b7280'
  },

  // 🔐 AUTH CONFIGURATION
  AUTH: {
    TOKEN_KEY: 'study_portal_token',
    USER_KEY: 'study_portal_user',
    TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    PASSWORD_MIN_LENGTH: 6
  },

  // 📁 STORAGE PATHS
  STORAGE_PATHS: {
    MATERIALS: '/materials',
    PROFILE_PICS: '/profiles',
    THUMBNAILS: '/thumbnails'
  },

  // 📈 ANALYTICS
  ANALYTICS: {
    ENABLED: process.env.NODE_ENV === 'production',
    TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID || ''
  },

  // 🚀 FEATURE FLAGS
  FEATURES: {
    ENABLE_UPLOADS: true,
    ENABLE_COMMENTS: true,
    ENABLE_RATINGS: true,
    ENABLE_DOWNLOADS: true,
    ENABLE_BOOKMARKS: true,
    ENABLE_SHARING: true,
    ENABLE_OFFLINE_MODE: false
  },

  // 🌐 SOCIAL LINKS
  SOCIAL: {
    GITHUB: 'https://github.com',
    TWITTER: 'https://twitter.com',
    LINKEDIN: 'https://linkedin.com',
    EMAIL: 'support@studyportal.com'
  }
};

// Helper functions
export const getCourseById = (courseId) => config.COURSES[courseId] || null;
export const getYearById = (yearId) => config.YEARS[yearId] || null;
export const getSemesterById = (semesterId) => config.SEMESTERS[semesterId] || null;
export const getMaterialType = (type) => config.MATERIAL_TYPES[type] || config.MATERIAL_TYPES['notes'];

// Get all courses as array
export const getAllCourses = () => Object.values(config.COURSES);

// Get course years
export const getCourseYears = (courseId) => {
  const course = getCourseById(courseId);
  if (!course) return [];
  
  return Array.from({ length: course.duration }, (_, i) => ({
    id: i + 1,
    ...config.YEARS[(i + 1).toString()]
  }));
};

// Get semesters for year
export const getSemestersForYear = (courseId, yearId) => {
  const course = getCourseById(courseId);
  if (!course) return [];
  
  const startSemester = (yearId - 1) * course.semestersPerYear + 1;
  
  return Array.from({ length: course.semestersPerYear }, (_, i) => ({
    id: startSemester + i,
    ...config.SEMESTERS[(startSemester + i).toString()]
  }));
};

// Get material types as array
export const getMaterialTypes = () => Object.entries(config.MATERIAL_TYPES).map(([key, value]) => ({
  id: key,
  ...value
}));

// Validate file type
export const isValidFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return config.UPLOAD_CONFIG.ALLOWED_FILE_TYPES.includes(extension);
};

// Validate file size
export const isValidFileSize = (fileSize) => {
  return fileSize <= config.UPLOAD_CONFIG.MAX_FILE_SIZE;
};

// Get subjects for semester (placeholder - aap apne data se replace kar sakte hain)
export const getSubjectsForSemester = (courseId, semesterId) => {
  // Mock data - aap apne database se replace kar sakte hain
  const subjectsData = {
    '1_1': [ // B.Tech Semester 1
      { id: 101, name: 'Mathematics-I', code: 'MATH101', credits: 4, type: 'core' },
      { id: 102, name: 'Physics', code: 'PHY101', credits: 4, type: 'core' },
      { id: 103, name: 'Chemistry', code: 'CHE101', credits: 4, type: 'core' },
      { id: 104, name: 'Programming in C', code: 'CSE101', credits: 3, type: 'core' },
      { id: 105, name: 'English', code: 'ENG101', credits: 2, type: 'general' },
    ],
    '1_2': [ // B.Tech Semester 2
      { id: 106, name: 'Mathematics-II', code: 'MATH102', credits: 4, type: 'core' },
      { id: 107, name: 'Digital Electronics', code: 'ECE101', credits: 4, type: 'core' },
      { id: 108, name: 'Data Structures', code: 'CSE201', credits: 4, type: 'core' },
      { id: 109, name: 'Discrete Mathematics', code: 'MATH201', credits: 3, type: 'core' },
    ],
    '2_1': [ // BCA Semester 1
      { id: 201, name: 'Programming Fundamentals', code: 'BCA101', credits: 4, type: 'core' },
      { id: 202, name: 'Digital Logic', code: 'BCA102', credits: 3, type: 'core' },
      { id: 203, name: 'Business Communication', code: 'BCA103', credits: 2, type: 'general' },
    ]
  };

  return subjectsData[`${courseId}_${semesterId}`] || [];
};

// Get materials for subject (placeholder)
export const getMaterialsForSubject = (subjectId) => {
  // Mock data
  const mockMaterials = [
    { id: 1, type: 'syllabus', title: 'Complete Syllabus', fileSize: '1.2 MB' },
    { id: 2, type: 'notes', title: 'Unit 1-5 Notes', fileSize: '4.5 MB' },
    { id: 3, type: 'pyq', title: 'PYQ 2020-2023', fileSize: '3.2 MB' },
    { id: 4, type: 'important', title: 'Important Questions Set', fileSize: '1.5 MB' },
  ];
  
  return mockMaterials;
};

export default config;