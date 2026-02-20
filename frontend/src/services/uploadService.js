// src/services/uploadService.js

// ✅ FIXED: Use environment variable or fallback to Render backend
const API_URL = process.env.REACT_APP_API_URL || 'https://study-portal-ill8.onrender.com';

// Get courses for upload dropdown
export const getCoursesForUpload = async () => {
  try {
    const token = localStorage.getItem('study_portal_token');
    
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// ✅ FIXED: Upload file for STUDY MATERIAL
export const uploadStudyMaterial = async (formData) => {
  try {
    const token = localStorage.getItem('study_portal_token');
    
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('study_portal_token');
        localStorage.removeItem('study_portal_user');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ✅ FIXED: Get upload history
export const getUploadHistory = async () => {
  try {
    const token = localStorage.getItem('study_portal_token');
    
    const response = await fetch(`${API_URL}/api/my-uploads`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upload history');
    }

    const data = await response.json();
    return data.uploads || [];
  } catch (error) {
    console.error('Error fetching upload history:', error);
    throw error;
  }
};

// ✅ FIXED: Delete upload
export const deleteUpload = async (uploadId, type = 'note') => {
  try {
    const token = localStorage.getItem('study_portal_token');
    
    const endpoint = type === 'material' 
      ? `${API_URL}/api/admin/materials/${uploadId}`
      : `${API_URL}/api/admin/notes/${uploadId}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete upload');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting upload:', error);
    throw error;
  }
};

// Get subjects for a course and semester
export const getSubjectsForCourse = async (courseId, semester) => {
  try {
    const token = localStorage.getItem('study_portal_token');
    
    const response = await fetch(`${API_URL}/api/courses/${courseId}/semester/${semester}/subjects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }

    const data = await response.json();
    return data.subjects || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

// Get materials for a subject
export const getSubjectMaterials = async (subjectId) => {
  try {
    const response = await fetch(`${API_URL}/api/subjects/${subjectId}/materials`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    const data = await response.json();
    return data.materials || {};
  } catch (error) {
    console.error('Error fetching materials:', error);
    return {};
  }
};

// Get file types (organized)
export const getFileTypes = () => {
  return [
    { value: 'notes', label: '📄 Study Notes' },
    { value: 'pyq', label: '📝 Previous Year Questions' },
    { value: 'syllabus', label: '📋 Syllabus' },
    { value: 'imp_questions', label: '❓ Important Questions' }
  ];
};

// Validate file before upload
export const validateFile = (file) => {
  const MAX_SIZE = 16 * 1024 * 1024; // 16MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];

  const errors = [];

  if (file.size > MAX_SIZE) {
    errors.push(`File size exceeds ${MAX_SIZE / (1024 * 1024)}MB limit`);
  }

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png)$/i)) {
    errors.push('File type not supported. Supported types: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check if user can upload
export const checkUploadPermission = async () => {
  try {
    const token = localStorage.getItem('study_portal_token');
    const user = JSON.parse(localStorage.getItem('study_portal_user') || '{}');
    
    if (!token) {
      return { canUpload: false, reason: 'Not authenticated' };
    }

    // Everyone can upload
    return { canUpload: true };
  } catch (error) {
    console.error('Error checking upload permission:', error);
    return { canUpload: false, reason: 'Error checking permissions' };
  }
};

// Create FormData for upload
export const createUploadFormData = (data) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('file', data.file);
  formData.append('course_name', data.courseName);
  formData.append('semester', data.semester);
  formData.append('subject_name', data.subjectName);
  formData.append('material_type', data.materialType);
  formData.append('title', data.title);
  
  // Optional fields
  if (data.description) {
    formData.append('description', data.description);
  }
  
  return formData;
};

// Export all functions
const uploadService = {
  getCoursesForUpload,
  uploadStudyMaterial,
  getUploadHistory,
  deleteUpload,
  getSubjectsForCourse,
  getSubjectMaterials,
  getFileTypes,
  validateFile,
  checkUploadPermission,
  createUploadFormData
};

export default uploadService;



// // src/services/uploadService.js
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// // Get courses for upload dropdown
// export const getCoursesForUpload = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/courses/upload`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error('Failed to fetch courses');
//     }

//     const data = await response.json();
//     return data.courses || [];
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     throw error;
//   }
// };

// // Upload file
// export const uploadFile = async (formData) => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     if (!token) {
//       throw new Error('Authentication required. Please login again.');
//     }

//     const response = await fetch(`${API_URL}/api/materials/upload`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         // Don't set Content-Type for FormData
//       },
//       body: formData,
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       if (response.status === 401) {
//         // Clear invalid token
//         localStorage.removeItem('study_portal_token');
//         localStorage.removeItem('study_portal_user');
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error(data.error || 'Upload failed');
//     }

//     return data;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };

// // Get upload history
// export const getUploadHistory = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/materials/my-uploads`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error('Failed to fetch upload history');
//     }

//     const data = await response.json();
//     return data.uploads || [];
//   } catch (error) {
//     console.error('Error fetching upload history:', error);
//     throw error;
//   }
// };

// // Delete upload
// export const deleteUpload = async (uploadId) => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/materials/${uploadId}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error('Failed to delete upload');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error deleting upload:', error);
//     throw error;
//   }
// };

// // Update upload status
// export const updateUploadStatus = async (uploadId, status) => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/materials/${uploadId}/status`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status }),
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error('Failed to update upload status');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error updating upload status:', error);
//     throw error;
//   }
// };

// // Get file types
// export const getFileTypes = () => {
//   return [
//     { value: 'notes', label: '📄 Notes' },
//     { value: 'pyq', label: '📝 Previous Year Questions' },
//     { value: 'syllabus', label: '📋 Syllabus' },
//     { value: 'lab', label: '🔬 Lab Manuals' },
//     { value: 'assignment', label: '📝 Assignments' },
//     { value: 'presentation', label: '📊 Presentations' },
//     { value: 'important', label: '❓ Important Questions' }
//   ];
// };

// // Validate file before upload
// export const validateFile = (file) => {
//   const MAX_SIZE = 10 * 1024 * 1024; // 10MB
//   const ALLOWED_TYPES = [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-powerpoint',
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'text/plain',
//     'image/jpeg',
//     'image/png'
//   ];

//   const errors = [];

//   if (file.size > MAX_SIZE) {
//     errors.push(`File size exceeds ${MAX_SIZE / (1024 * 1024)}MB limit`);
//   }

//   if (!ALLOWED_TYPES.includes(file.type)) {
//     errors.push('File type not supported. Supported types: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG');
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// };

// // Add sample courses (for testing)
// export const addSampleCourses = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/add-courses-public`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to add sample courses');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error adding sample courses:', error);
//     throw error;
//   }
// };

// // Check if user can upload
// export const checkUploadPermission = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
//     const user = JSON.parse(localStorage.getItem('study_portal_user') || '{}');
    
//     // Check if token exists
//     if (!token) {
//       return { canUpload: false, reason: 'Not authenticated' };
//     }

//     // Check if user has upload permission
//     if (user.role === 'admin' || user.role === 'student') {
//       return { canUpload: true };
//     }

//     return { canUpload: false, reason: 'Insufficient permissions' };
//   } catch (error) {
//     console.error('Error checking upload permission:', error);
//     return { canUpload: false, reason: 'Error checking permissions' };
//   }
// };

// // ✅ FIX: Create named export object instead of anonymous default export
// const uploadService = {
//   getCoursesForUpload,
//   uploadFile,
//   getUploadHistory,
//   deleteUpload,
//   updateUploadStatus,
//   getFileTypes,
//   validateFile,
//   addSampleCourses,
//   checkUploadPermission
// };

// export default uploadService;


// // src/services/uploadService.js
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// // Get courses for upload dropdown
// export const getCoursesForUpload = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/courses`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch courses');
//     }

//     const data = await response.json();
//     return data.courses || [];
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     throw error;
//   }
// };

// // ✅ FIXED: Upload file for STUDY MATERIAL (organized structure)
// export const uploadStudyMaterial = async (formData) => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     if (!token) {
//       throw new Error('Authentication required. Please login again.');
//     }

//     const response = await fetch(`${API_URL}/api/upload-study-material`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         // Don't set Content-Type for FormData, browser will set it automatically
//       },
//       body: formData,
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       if (response.status === 401) {
//         // Clear invalid token
//         localStorage.removeItem('study_portal_token');
//         localStorage.removeItem('study_portal_user');
//         throw new Error('Session expired. Please login again.');
//       }
//       throw new Error(data.error || 'Upload failed');
//     }

//     return data;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };

// // ✅ FIXED: Get upload history
// export const getUploadHistory = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/my-uploads`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch upload history');
//     }

//     const data = await response.json();
//     return data.uploads || [];
//   } catch (error) {
//     console.error('Error fetching upload history:', error);
//     throw error;
//   }
// };

// // ✅ FIXED: Delete upload
// export const deleteUpload = async (uploadId, type = 'note') => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const endpoint = type === 'material' 
//       ? `${API_URL}/api/admin/materials/${uploadId}` // You need to add this route
//       : `${API_URL}/api/admin/notes/${uploadId}`;
    
//     const response = await fetch(endpoint, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to delete upload');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error deleting upload:', error);
//     throw error;
//   }
// };

// // Get subjects for a course and semester
// export const getSubjectsForCourse = async (courseId, semester) => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
    
//     const response = await fetch(`${API_URL}/api/courses/${courseId}/semester/${semester}/subjects`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch subjects');
//     }

//     const data = await response.json();
//     return data.subjects || [];
//   } catch (error) {
//     console.error('Error fetching subjects:', error);
//     return []; // Return empty array if no subjects
//   }
// };

// // Get materials for a subject
// export const getSubjectMaterials = async (subjectId) => {
//   try {
//     const response = await fetch(`${API_URL}/api/subjects/${subjectId}/materials`, {
//       method: 'GET',
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch materials');
//     }

//     const data = await response.json();
//     return data.materials || {};
//   } catch (error) {
//     console.error('Error fetching materials:', error);
//     return {};
//   }
// };

// // Get file types (organized)
// export const getFileTypes = () => {
//   return [
//     { value: 'notes', label: '📄 Study Notes' },
//     { value: 'pyq', label: '📝 Previous Year Questions' },
//     { value: 'syllabus', label: '📋 Syllabus' },
//     { value: 'imp_questions', label: '❓ Important Questions' }
//   ];
// };

// // Validate file before upload
// export const validateFile = (file) => {
//   const MAX_SIZE = 16 * 1024 * 1024; // 16MB (matching Flask config)
//   const ALLOWED_TYPES = [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-powerpoint',
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'text/plain',
//     'image/jpeg',
//     'image/png'
//   ];

//   const errors = [];

//   if (file.size > MAX_SIZE) {
//     errors.push(`File size exceeds ${MAX_SIZE / (1024 * 1024)}MB limit`);
//   }

//   if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png)$/i)) {
//     errors.push('File type not supported. Supported types: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG');
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// };

// // Check if user can upload
// export const checkUploadPermission = async () => {
//   try {
//     const token = localStorage.getItem('study_portal_token');
//     const user = JSON.parse(localStorage.getItem('study_portal_user') || '{}');
    
//     if (!token) {
//       return { canUpload: false, reason: 'Not authenticated' };
//     }

//     // Everyone can upload
//     return { canUpload: true };
//   } catch (error) {
//     console.error('Error checking upload permission:', error);
//     return { canUpload: false, reason: 'Error checking permissions' };
//   }
// };

// // Create FormData for upload
// export const createUploadFormData = (data) => {
//   const formData = new FormData();
  
//   // Required fields
//   formData.append('file', data.file);
//   formData.append('course_name', data.courseName);
//   formData.append('semester', data.semester);
//   formData.append('subject_name', data.subjectName);
//   formData.append('material_type', data.materialType);
//   formData.append('title', data.title);
  
//   // Optional fields
//   if (data.description) {
//     formData.append('description', data.description);
//   }
  
//   return formData;
// };

// // Export all functions
// const uploadService = {
//   getCoursesForUpload,
//   uploadStudyMaterial,
//   getUploadHistory,
//   deleteUpload,
//   getSubjectsForCourse,
//   getSubjectMaterials,
//   getFileTypes,
//   validateFile,
//   checkUploadPermission,
//   createUploadFormData
// };

// export default uploadService;