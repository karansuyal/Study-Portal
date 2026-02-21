// src/pages/Upload.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';
import { coursesData } from '../data/coursesData';

// ✅ FIXED: Use Render backend URL
const API_URL = 'https://study-portal-ill8.onrender.com/api';

const Upload = () => {
  const navigate = useNavigate();
  
  // User state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  // Complete form data
  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    description: '',
    
    // Academic info
    course: 'B.Tech',
    branch: 'CSE',
    year: '1',
    semester: '1',
    subject: '',
    subject_code: '',
    
    // Material info
    type: 'notes',
    tags: ''
  });

  // Available options
  const courseOptions = [
    { value: 'B.Tech', label: 'B.Tech (Computer Science)' },
    { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
    { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
    { value: 'MBA', label: 'MBA (Master of Business Administration)' }
  ];
  
  const branchOptions = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Computer Applications', 'General'];
  const yearOptions = ['1', '2', '3', '4'];
  const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  const materialTypes = [
    { value: 'notes', label: '📄 Notes' },
    { value: 'pyq', label: '📝 Previous Year Questions (PYQ)' },
    { value: 'syllabus', label: '📋 Syllabus' },
    { value: 'lab', label: '🔬 Lab Manuals' },
    { value: 'assignment', label: '📝 Assignments' },
    { value: 'presentation', label: '📊 Presentations' },
    { value: 'important', label: '❓ Important Questions' },
    { value: 'project', label: '📁 Project Report' },
    { value: 'book', label: '📚 Reference Book' }
  ];

  // ✅ FIXED: Correct course ID mapping based on your database
  const getCourseIdFromName = (courseName) => {
    const courseMap = {
      'B.Tech': 1,    // BTECH ka actual ID
      'BCA': 2,       // BCA ka actual ID
      'BBA': 3,       // BBA ka actual ID
      'MBA': 4,       // MBA ka actual ID
      'MCA': 5        // MCA ka actual ID
    };
    return courseMap[courseName] || 1;  // Default to BTECH
  };

  // ✅ FIXED: Get course name for folder creation
  const getCourseFolderName = (courseName) => {
    const folderMap = {
      'B.Tech': 'BTECH',
      'BCA': 'BCA',
      'BBA': 'BBA',
      'MCA': 'MCA',
      'MBA': 'MBA'
    };
    return folderMap[courseName] || 'BTECH';
  };

  // Function to get appropriate branch based on course
  const getBranchOptions = (course) => {
    const branchMap = {
      'B.Tech': ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'],
      'BCA': ['Computer Applications'],
      'BBA': ['General'],
      'MCA': ['Computer Applications'],
      'MBA': ['General']
    };
    return branchMap[course] || ['CSE'];
  };

  // ✅ FIXED: Get subjects from coursesData as objects
  const getSubjectsFromCourseData = (courseName, year, semester) => {
    try {
      const courseId = getCourseIdFromName(courseName);
      if (!courseId) return [];
      
      // Get subjects from coursesData
      const course = coursesData[courseId];
      if (!course || !course.years[year] || !course.years[year].semesters[semester]) {
        return [];
      }
      
      const subjectsList = course.years[year].semesters[semester];
      
      // Format subjects with name and code - return as objects
      return subjectsList.map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        displayName: `${subject.name} (${subject.code})`,
        credits: subject.credits,
        type: subject.type
      }));
      
    } catch (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
  };

  useEffect(() => {
    // Check authentication
    const savedUser = localStorage.getItem('study_portal_user');
    const savedToken = localStorage.getItem('study_portal_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Auto-fill user's academic details
        if (userData.course) setFormData(prev => ({ ...prev, course: userData.course }));
        if (userData.branch) setFormData(prev => ({ ...prev, branch: userData.branch }));
        if (userData.year) setFormData(prev => ({ ...prev, year: userData.year.toString() }));
        if (userData.semester) setFormData(prev => ({ ...prev, semester: userData.semester.toString() }));
        
      } catch (error) {
        console.error('Error parsing user:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    
    // Load courses from backend
    fetchCoursesFromBackend();
  }, [navigate]);

  // ✅ FIXED: Update subjects when course, year, or semester changes
  useEffect(() => {
    updateSubjects();
  }, [formData.course, formData.year, formData.semester]);

  // Update branch options when course changes
  useEffect(() => {
    const newBranchOptions = getBranchOptions(formData.course);
    if (!newBranchOptions.includes(formData.branch)) {
      setFormData(prev => ({ ...prev, branch: newBranchOptions[0] }));
    }
  }, [formData.course]);

  const fetchCoursesFromBackend = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch(`${API_URL}/courses`);
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        console.log('📚 Courses from backend:', data.courses);
      } else {
        console.warn('Could not fetch courses from backend');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // ✅ FIXED: updateSubjects function - stores subjects as objects with IDs
  const updateSubjects = () => {
    const { course, year, semester } = formData;
    
    let availableSubjects = [];
    
    // Get subjects from coursesData as objects
    const subjectsFromDB = getSubjectsFromCourseData(course, year, semester);
    
    if (subjectsFromDB.length > 0) {
      // Store as objects with IDs
      availableSubjects = subjectsFromDB;
      
      // Add custom option as object
      availableSubjects.push({
        id: 'custom',
        name: 'Other - Custom Subject',
        code: 'CUSTOM',
        displayName: 'Other - Custom Subject',
        isCustom: true
      });
    } else {
      availableSubjects = [{
        id: 'custom',
        name: 'Other - Custom Subject',
        code: 'CUSTOM',
        displayName: 'Other - Custom Subject',
        isCustom: true
      }];
    }
    
    setSubjects(availableSubjects);
    console.log('📚 Subjects loaded:', availableSubjects);
    
    // Reset subject if not in new list
    if (formData.subject && !availableSubjects.some(s => s.displayName === formData.subject)) {
      setFormData(prev => ({ ...prev, subject: '', subject_code: '' }));
    }
  };

  const updateSubjectCode = () => {
    const { subject } = formData;
    
    if (!subject) {
      setFormData(prev => ({ ...prev, subject_code: '' }));
      return;
    }
    
    // Find selected subject object
    const selectedSubject = subjects.find(s => s.displayName === subject);
    
    if (selectedSubject && !selectedSubject.isCustom) {
      // Regular subject - use actual code
      setFormData(prev => ({ ...prev, subject_code: selectedSubject.code }));
    } else {
      // Custom subject or no match
      setFormData(prev => ({ ...prev, subject_code: 'CUSTOM' }));
    }
  };

  const getCurrentBranchOptions = () => {
    return getBranchOptions(formData.course);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('❌ File size exceeds 10MB limit');
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('❌ File type not supported. Please upload PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, or PNG files.');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'course') {
      // When course changes, reset branch to first option
      const newBranchOptions = getBranchOptions(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        branch: newBranchOptions[0],
        subject: '',
        subject_code: ''
      }));
    } else if (name === 'subject') {
      // Subject changed - update subject code
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Find selected subject and update code
      const selectedSubject = subjects.find(s => s.displayName === value);
      if (selectedSubject && !selectedSubject.isCustom) {
        setFormData(prev => ({ ...prev, subject_code: selectedSubject.code }));
      } else {
        setFormData(prev => ({ ...prev, subject_code: 'CUSTOM' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ FIXED: handleUpload function with proper subject ID handling
  const handleUpload = async () => {
    // Validation
    if (!file) {
      alert('❌ Please select a file');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('❌ Please enter title');
      return;
    }
    
    if (!formData.subject) {
      alert('❌ Please select subject');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('study_portal_token');
      
      if (!token) {
        throw new Error('Authentication token missing. Please login again.');
      }

      // Prepare FormData for backend
      const uploadData = new FormData();
      
      // ✅ Find the selected subject object
      const selectedSubject = subjects.find(s => s.displayName === formData.subject);
      
      let subjectId = null;
      let subjectName = formData.subject;
      let subjectCode = formData.subject_code;
      
      if (selectedSubject) {
        if (!selectedSubject.isCustom) {
          // Regular subject - has ID
          subjectId = selectedSubject.id;
          subjectName = selectedSubject.name;
          subjectCode = selectedSubject.code;
          console.log('✅ Found subject:', subjectName, 'with ID:', subjectId);
        } else {
          // Custom subject - no ID
          console.log('⚠️ Custom subject selected, no ID');
          // If custom subject with custom name
          if (formData.subject !== 'Other - Custom Subject') {
            subjectName = formData.subject;
          }
        }
      }
      
      // Get correct course ID
      const courseId = getCourseIdFromName(formData.course);
      const courseFolder = getCourseFolderName(formData.course);
      
      console.log('📤 UPLOAD DEBUG:');
      console.log('   Selected Course:', formData.course);
      console.log('   Course Folder:', courseFolder);
      console.log('   Course ID:', courseId);
      console.log('   Subject Name:', subjectName);
      console.log('   Subject ID:', subjectId);
      console.log('   Subject Code:', subjectCode);
      console.log('   Type:', formData.type);
      console.log('   Year:', formData.year);
      console.log('   Semester:', formData.semester);
      
      // Required fields for backend
      uploadData.append('file', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description || '');
      uploadData.append('course_id', courseId.toString());
      
      // ✅ Send subject_id if available
      if (subjectId) {
        uploadData.append('subject_id', subjectId.toString());
      }
      
      uploadData.append('subject', subjectName);
      uploadData.append('subject_code', subjectCode || '');
      uploadData.append('type', formData.type);
      uploadData.append('semester', formData.semester);
      uploadData.append('year', formData.year);
      uploadData.append('tags', formData.tags || '');
      
      // Additional academic details for description
      const fullDescription = `
${formData.description || ''}

--- Academic Details ---
Course: ${formData.course}
Course Folder: ${courseFolder}
Branch: ${formData.branch}
Year: ${formData.year}
Semester: ${formData.semester}
Subject: ${subjectName}
Subject Code: ${subjectCode || 'N/A'}
Subject ID: ${subjectId || 'N/A'}
Material Type: ${formData.type}
Tags: ${formData.tags || 'None'}
Uploaded by: ${user?.name || 'Unknown'} (${user?.email || 'N/A'})
Upload Date: ${new Date().toLocaleDateString()}
      `.trim();
      
      uploadData.append('description', fullDescription);

      // ✅ FIXED: Send to Render backend
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('Response data:', result);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      if (response.ok) {
        // Success
        alert(`✅ ${result.message || 'File uploaded successfully!'}\n\n` +
          `📝 Status: ${result.status || 'Pending approval'}\n\n` +
          `🎓 Course: ${formData.course} (ID: ${courseId})\n` +
          `📚 Subject: ${subjectName} (ID: ${subjectId || 'N/A'})\n` +
          `📖 Year: ${formData.year}, Semester: ${formData.semester}\n\n` +
          `⚠️ Note: File will be visible after admin approval.`);
        
        // Reset form
        resetForm();
        
      } else {
        // Error
        let errorMsg = result.error || 'Server error';
        
        if (response.status === 422) {
          errorMsg = `Validation Error: ${result.details || 'Please check all required fields are filled correctly.'}`;
        } else if (response.status === 401) {
          errorMsg = 'Authentication failed. Please login again.';
          handleLogout();
        }
        
        alert(`❌ Upload failed: ${errorMsg}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert(`❌ Network Error: Cannot connect to backend at ${API_URL}\n\nPlease ensure backend server is running.`);
      } else {
        alert(`❌ Upload Error: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFormData({
      title: '',
      description: '',
      course: 'B.Tech',
      branch: 'CSE',
      year: '1',
      semester: '1',
      subject: '',
      subject_code: '',
      type: 'notes',
      tags: ''
    });
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  const handleLogout = () => {
    localStorage.removeItem('study_portal_token');
    localStorage.removeItem('study_portal_user');
    navigate('/login');
  };

  // Show loading while checking authentication
  if (!user && isAuthenticated === false) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading authentication...</p>
      </div>
    );
  }

  const currentBranchOptions = getCurrentBranchOptions();

  return (
    <div className="upload-container">
      {/* Header */}
      <div className="upload-header-row">
        <header className="upload-header">
          <h1 className="upload-title">📤 Upload Study Materials</h1>
          <p className="upload-subtitle">
            Share your notes, PYQs, and study materials with complete academic details
          </p>
        </header>
        
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <p className="user-name">
            Uploading as: <span>{user?.name || 'User'}</span>
          </p>
          <p className="user-meta">
            {user?.course || 'Course'} • {user?.branch || 'Branch'} • Semester {user?.semester || 'Semester'}
          </p>
          <p className="user-email">
            {user?.email || 'Email not provided'}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <p><strong>📋 Instructions:</strong> Fill all academic details accurately. This helps students find relevant materials.</p>
        <p><small>✅ All subjects are fetched from your course data structure</small></p>
      </div>

      {/* File Upload Section */}
      <div className="upload-box">
        <input
          type="file"
          id="fileInput"
          className="file-input"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
        />
        <label htmlFor="fileInput" className="upload-label">
          📁 Choose File to Upload
        </label>
        
        {file && (
          <div className="file-info">
            <div className="file-info-row">
              <span className="file-info-label">📄 File:</span>
              <span className="file-info-value">{file.name}</span>
            </div>
            <div className="file-info-row">
              <span className="file-info-label">📏 Size:</span>
              <span className="file-info-value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="file-info-row">
              <span className="file-info-label">📝 Type:</span>
              <span className="file-info-value">{file.type}</span>
            </div>
          </div>
        )}
        
        <p className="file-types">
          📎 <strong>Supported Formats:</strong> PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, JPEG, PNG
          <br />
          ⚠️ <strong>Maximum file size:</strong> 10MB
        </p>
      </div>

      {/* Upload Form */}
      <div className="upload-form">
        <h3 className="form-section-title">📄 Material Details</h3>
        
        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            Title <span className="required">*</span>
            <small>(Descriptive title of your material)</small>
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Complete Data Structures Notes, Operating Systems PYQ 2023"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Description <small>(Optional details about the material)</small>
          </label>
          <textarea
            name="description"
            placeholder="Describe what's included in this material, important topics covered, etc."
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
          />
        </div>

        <h3 className="form-section-title">🎓 Academic Details</h3>
        
        <div className="form-row">
          {/* Course */}
          <div className="form-group half">
            <label className="form-label">Course <span className="required">*</span></label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {courseOptions.map(course => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="form-group half">
            <label className="form-label">Branch/Specialization <span className="required">*</span></label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {currentBranchOptions.map(branch => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          {/* Year */}
          <div className="form-group half">
            <label className="form-label">Year <span className="required">*</span></label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="form-group half">
            <label className="form-label">Semester <span className="required">*</span></label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {semesterOptions.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label className="form-label">
            Subject <span className="required">*</span>
            <small>(Subjects fetched from your course data)</small>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.displayName}>
                {subject.displayName}
              </option>
            ))}
          </select>
          {subjects.length === 1 && subjects[0].isCustom && (
            <div className="form-info">
              ℹ️ No predefined subjects found for this semester. Select "Other - Custom Subject" and enter subject name in Title.
            </div>
          )}
        </div>

        <div className="form-row">
          {/* Subject Code (Auto-generated) */}
          <div className="form-group half">
            <label className="form-label">
              Subject Code <small>(Auto-generated from course data)</small>
            </label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              readOnly
              className="form-input"
              style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>

          {/* Material Type */}
          <div className="form-group half">
            <label className="form-label">Material Type <span className="required">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {materialTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            Tags <small>(Comma separated, e.g., important, unit1, theory)</small>
          </label>
          <input
            type="text"
            name="tags"
            placeholder="important, unit1, theory, practical, exam, lab"
            value={formData.tags}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        {/* Summary Preview */}
        {formData.subject && (
          <div className="summary-preview">
            <h4>📋 Upload Summary</h4>
            <div className="summary-details">
              <p><strong>Course:</strong> {formData.course}</p>
              <p><strong>Branch:</strong> {formData.branch}</p>
              <p><strong>Year/Semester:</strong> Year {formData.year}, Semester {formData.semester}</p>
              <p><strong>Subject:</strong> {formData.subject}</p>
              <p><strong>Subject Code:</strong> {formData.subject_code}</p>
              <p><strong>Material Type:</strong> {materialTypes.find(t => t.value === formData.type)?.label || formData.type}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="upload-action">
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !formData.title || !formData.subject}
            className="upload-btn"
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                ⏳ Uploading...
              </>
            ) : (
              '📤 Upload Material'
            )}
          </button>
          
          <button
            onClick={resetForm}
            type="button"
            className="reset-btn"
          >
            🔄 Reset Form
          </button>
        </div>

        <div className="admin-note">
          <div className="admin-note-icon">⚠️</div>
          <div className="admin-note-content">
            <strong>Important Note:</strong> All uploads require admin approval. 
            Your file will be visible to students after review. 
            Please ensure all academic details are accurate.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;





// // src/pages/Upload.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Upload.css';
// import { coursesData } from '../data/coursesData';

// const Upload = () => {
//   const navigate = useNavigate();
  
//   // User state
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
  
//   // Upload states
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [courses, setCourses] = useState([]);
//   const [loadingCourses, setLoadingCourses] = useState(false);
//   const [subjects, setSubjects] = useState([]);
  
//   // Complete form data
//   const [formData, setFormData] = useState({
//     // Basic info
//     title: '',
//     description: '',
    
//     // Academic info
//     course: 'B.Tech',
//     branch: 'CSE',
//     year: '1',
//     semester: '1',
//     subject: '',
//     subject_code: '',
    
//     // Material info
//     type: 'notes',
//     tags: ''
//   });

//   // Available options
//   const courseOptions = [
//     { value: 'B.Tech', label: 'B.Tech (Computer Science)' },
//     { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
//     { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
//     { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
//     { value: 'MBA', label: 'MBA (Master of Business Administration)' }
//   ];
  
//   const branchOptions = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Computer Applications', 'General'];
//   const yearOptions = ['1', '2', '3', '4'];
//   const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
//   const materialTypes = [
//     { value: 'notes', label: '📄 Notes' },
//     { value: 'pyq', label: '📝 Previous Year Questions (PYQ)' },
//     { value: 'syllabus', label: '📋 Syllabus' },
//     { value: 'lab', label: '🔬 Lab Manuals' },
//     { value: 'assignment', label: '📝 Assignments' },
//     { value: 'presentation', label: '📊 Presentations' },
//     { value: 'important', label: '❓ Important Questions' },
//     { value: 'project', label: '📁 Project Report' },
//     { value: 'book', label: '📚 Reference Book' }
//   ];

//   // ✅ FIXED: Correct course ID mapping based on your database
//   const getCourseIdFromName = (courseName) => {
//     const courseMap = {
//       'B.Tech': 1,    // BTECH ka actual ID
//       'BCA': 2,       // BCA ka actual ID
//       'BBA': 3,       // BBA ka actual ID
//       'MBA': 4,       // MBA ka actual ID
//       'MCA': 5        // McA ka actual ID
//     };
//     return courseMap[courseName] || 1;  // Default to BTECH
//   };

//   // ✅ FIXED: Get course name for folder creation
//   const getCourseFolderName = (courseName) => {
//     const folderMap = {
//       'B.Tech': 'BTECH',
//       'BCA': 'BCA',
//       'BBA': 'BBA',
//       'MCA': 'MCA',
//       'MBA': 'MBA'
//     };
//     return folderMap[courseName] || 'BTECH';
//   };

//   // Function to get appropriate branch based on course
//   const getBranchOptions = (course) => {
//     const branchMap = {
//       'B.Tech': ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'],
//       'BCA': ['Computer Applications'],
//       'BBA': ['General'],
//       'MCA': ['Computer Applications'],
//       'MBA': ['General']
//     };
//     return branchMap[course] || ['CSE'];
//   };

//   // ✅ FIXED: Get subjects from coursesData as objects
//   const getSubjectsFromCourseData = (courseName, year, semester) => {
//     try {
//       const courseId = getCourseIdFromName(courseName);
//       if (!courseId) return [];
      
//       // Get subjects from coursesData
//       const course = coursesData[courseId];
//       if (!course || !course.years[year] || !course.years[year].semesters[semester]) {
//         return [];
//       }
      
//       const subjectsList = course.years[year].semesters[semester];
      
//       // Format subjects with name and code - return as objects
//       return subjectsList.map(subject => ({
//         id: subject.id,
//         name: subject.name,
//         code: subject.code,
//         displayName: `${subject.name} (${subject.code})`,
//         credits: subject.credits,
//         type: subject.type
//       }));
      
//     } catch (error) {
//       console.error('Error getting subjects:', error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     // Check authentication
//     const savedUser = localStorage.getItem('study_portal_user');
//     const savedToken = localStorage.getItem('study_portal_token');
    
//     if (savedUser && savedToken) {
//       try {
//         const userData = JSON.parse(savedUser);
//         setUser(userData);
//         setIsAuthenticated(true);
        
//         // Auto-fill user's academic details
//         if (userData.course) setFormData(prev => ({ ...prev, course: userData.course }));
//         if (userData.branch) setFormData(prev => ({ ...prev, branch: userData.branch }));
//         if (userData.year) setFormData(prev => ({ ...prev, year: userData.year.toString() }));
//         if (userData.semester) setFormData(prev => ({ ...prev, semester: userData.semester.toString() }));
        
//       } catch (error) {
//         console.error('Error parsing user:', error);
//         navigate('/login');
//       }
//     } else {
//       navigate('/login');
//     }
    
//     // Load courses from backend
//     fetchCoursesFromBackend();
//   }, [navigate]);

//   // ✅ FIXED: Update subjects when course, year, or semester changes
//   useEffect(() => {
//     updateSubjects();
//   }, [formData.course, formData.year, formData.semester]);

//   // Update branch options when course changes
//   useEffect(() => {
//     const newBranchOptions = getBranchOptions(formData.course);
//     if (!newBranchOptions.includes(formData.branch)) {
//       setFormData(prev => ({ ...prev, branch: newBranchOptions[0] }));
//     }
//   }, [formData.course]);

//   const fetchCoursesFromBackend = async () => {
//     try {
//       setLoadingCourses(true);
//       const response = await fetch('http://localhost:5000/api/courses');
      
//       if (response.ok) {
//         const data = await response.json();
//         setCourses(data.courses || []);
//         console.log('📚 Courses from backend:', data.courses);
//       } else {
//         console.warn('Could not fetch courses from backend');
//       }
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//     } finally {
//       setLoadingCourses(false);
//     }
//   };

//   // ✅ FIXED: updateSubjects function - stores subjects as objects with IDs
//   const updateSubjects = () => {
//     const { course, year, semester } = formData;
    
//     let availableSubjects = [];
    
//     // Get subjects from coursesData as objects
//     const subjectsFromDB = getSubjectsFromCourseData(course, year, semester);
    
//     if (subjectsFromDB.length > 0) {
//       // Store as objects with IDs
//       availableSubjects = subjectsFromDB;
      
//       // Add custom option as object
//       availableSubjects.push({
//         id: 'custom',
//         name: 'Other - Custom Subject',
//         code: 'CUSTOM',
//         displayName: 'Other - Custom Subject',
//         isCustom: true
//       });
//     } else {
//       availableSubjects = [{
//         id: 'custom',
//         name: 'Other - Custom Subject',
//         code: 'CUSTOM',
//         displayName: 'Other - Custom Subject',
//         isCustom: true
//       }];
//     }
    
//     setSubjects(availableSubjects);
//     console.log('📚 Subjects loaded:', availableSubjects);
    
//     // Reset subject if not in new list
//     if (formData.subject && !availableSubjects.some(s => s.displayName === formData.subject)) {
//       setFormData(prev => ({ ...prev, subject: '', subject_code: '' }));
//     }
//   };

//   const updateSubjectCode = () => {
//     const { subject } = formData;
    
//     if (!subject) {
//       setFormData(prev => ({ ...prev, subject_code: '' }));
//       return;
//     }
    
//     // Find selected subject object
//     const selectedSubject = subjects.find(s => s.displayName === subject);
    
//     if (selectedSubject && !selectedSubject.isCustom) {
//       // Regular subject - use actual code
//       setFormData(prev => ({ ...prev, subject_code: selectedSubject.code }));
//     } else {
//       // Custom subject or no match
//       setFormData(prev => ({ ...prev, subject_code: 'CUSTOM' }));
//     }
//   };

//   const getCurrentBranchOptions = () => {
//     return getBranchOptions(formData.course);
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       // Validate file size
//       if (selectedFile.size > 10 * 1024 * 1024) {
//         alert('❌ File size exceeds 10MB limit');
//         e.target.value = '';
//         return;
//       }
      
//       // Validate file type
//       const allowedTypes = [
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'application/vnd.ms-powerpoint',
//         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//         'text/plain',
//         'image/jpeg',
//         'image/png'
//       ];
      
//       if (!allowedTypes.includes(selectedFile.type)) {
//         alert('❌ File type not supported. Please upload PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, or PNG files.');
//         e.target.value = '';
//         return;
//       }
      
//       setFile(selectedFile);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'course') {
//       // When course changes, reset branch to first option
//       const newBranchOptions = getBranchOptions(value);
//       setFormData(prev => ({ 
//         ...prev, 
//         [name]: value,
//         branch: newBranchOptions[0],
//         subject: '',
//         subject_code: ''
//       }));
//     } else if (name === 'subject') {
//       // Subject changed - update subject code
//       setFormData(prev => ({ ...prev, [name]: value }));
      
//       // Find selected subject and update code
//       const selectedSubject = subjects.find(s => s.displayName === value);
//       if (selectedSubject && !selectedSubject.isCustom) {
//         setFormData(prev => ({ ...prev, subject_code: selectedSubject.code }));
//       } else {
//         setFormData(prev => ({ ...prev, subject_code: 'CUSTOM' }));
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   // ✅ FIXED: handleUpload function with proper subject ID handling
//   const handleUpload = async () => {
//     // Validation
//     if (!file) {
//       alert('❌ Please select a file');
//       return;
//     }
    
//     if (!formData.title.trim()) {
//       alert('❌ Please enter title');
//       return;
//     }
    
//     if (!formData.subject) {
//       alert('❌ Please select subject');
//       return;
//     }

//     setUploading(true);

//     try {
//       const token = localStorage.getItem('study_portal_token');
      
//       if (!token) {
//         throw new Error('Authentication token missing. Please login again.');
//       }

//       // Prepare FormData for backend
//       const uploadData = new FormData();
      
//       // ✅ Find the selected subject object
//       const selectedSubject = subjects.find(s => s.displayName === formData.subject);
      
//       let subjectId = null;
//       let subjectName = formData.subject;
//       let subjectCode = formData.subject_code;
      
//       if (selectedSubject) {
//         if (!selectedSubject.isCustom) {
//           // Regular subject - has ID
//           subjectId = selectedSubject.id;
//           subjectName = selectedSubject.name;
//           subjectCode = selectedSubject.code;
//           console.log('✅ Found subject:', subjectName, 'with ID:', subjectId);
//         } else {
//           // Custom subject - no ID
//           console.log('⚠️ Custom subject selected, no ID');
//           // If custom subject with custom name
//           if (formData.subject !== 'Other - Custom Subject') {
//             subjectName = formData.subject;
//           }
//         }
//       }
      
//       // Get correct course ID
//       const courseId = getCourseIdFromName(formData.course);
//       const courseFolder = getCourseFolderName(formData.course);
      
//       console.log('📤 UPLOAD DEBUG:');
//       console.log('   Selected Course:', formData.course);
//       console.log('   Course Folder:', courseFolder);
//       console.log('   Course ID:', courseId);
//       console.log('   Subject Name:', subjectName);
//       console.log('   Subject ID:', subjectId);
//       console.log('   Subject Code:', subjectCode);
//       console.log('   Type:', formData.type);
//       console.log('   Year:', formData.year);
//       console.log('   Semester:', formData.semester);
      
//       // Required fields for backend
//       uploadData.append('file', file);
//       uploadData.append('title', formData.title);
//       uploadData.append('description', formData.description || '');
//       uploadData.append('course_id', courseId.toString());
      
//       // ✅ Send subject_id if available
//       if (subjectId) {
//         uploadData.append('subject_id', subjectId.toString());
//       }
      
//       uploadData.append('subject', subjectName);
//       uploadData.append('subject_code', subjectCode || '');
//       uploadData.append('type', formData.type);
//       uploadData.append('semester', formData.semester);
//       uploadData.append('year', formData.year);
//       uploadData.append('tags', formData.tags || '');
      
//       // Additional academic details for description
//       const fullDescription = `
// ${formData.description || ''}

// --- Academic Details ---
// Course: ${formData.course}
// Course Folder: ${courseFolder}
// Branch: ${formData.branch}
// Year: ${formData.year}
// Semester: ${formData.semester}
// Subject: ${subjectName}
// Subject Code: ${subjectCode || 'N/A'}
// Subject ID: ${subjectId || 'N/A'}
// Material Type: ${formData.type}
// Tags: ${formData.tags || 'None'}
// Uploaded by: ${user?.name || 'Unknown'} (${user?.email || 'N/A'})
// Upload Date: ${new Date().toLocaleDateString()}
//       `.trim();
      
//       uploadData.append('description', fullDescription);

//       // Send to backend
//       const response = await fetch('http://localhost:5000/api/upload', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: uploadData,
//       });

//       console.log('Response status:', response.status);
      
//       let result;
//       try {
//         result = await response.json();
//         console.log('Response data:', result);
//       } catch (jsonError) {
//         console.error('Error parsing JSON:', jsonError);
//         throw new Error('Invalid response from server');
//       }
      
//       if (response.ok) {
//         // Success
//         alert(`✅ ${result.message || 'File uploaded successfully!'}\n\n` +
//           `📝 Status: ${result.status || 'Pending approval'}\n\n` +
//           `🎓 Course: ${formData.course} (ID: ${courseId})\n` +
//           `📚 Subject: ${subjectName} (ID: ${subjectId || 'N/A'})\n` +
//           `📖 Year: ${formData.year}, Semester: ${formData.semester}\n\n` +
//           `⚠️ Note: File will be visible after admin approval.`);
        
//         // Reset form
//         resetForm();
        
//       } else {
//         // Error
//         let errorMsg = result.error || 'Server error';
        
//         if (response.status === 422) {
//           errorMsg = `Validation Error: ${result.details || 'Please check all required fields are filled correctly.'}`;
//         } else if (response.status === 401) {
//           errorMsg = 'Authentication failed. Please login again.';
//           handleLogout();
//         }
        
//         alert(`❌ Upload failed: ${errorMsg}`);
//       }
      
//     } catch (error) {
//       console.error('Upload error:', error);
      
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         alert('❌ Network Error: Cannot connect to backend at http://localhost:5000\n\nPlease ensure backend server is running.');
//       } else {
//         alert(`❌ Upload Error: ${error.message}`);
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   const resetForm = () => {
//     setFile(null);
//     setFormData({
//       title: '',
//       description: '',
//       course: 'B.Tech',
//       branch: 'CSE',
//       year: '1',
//       semester: '1',
//       subject: '',
//       subject_code: '',
//       type: 'notes',
//       tags: ''
//     });
//     const fileInput = document.getElementById('fileInput');
//     if (fileInput) fileInput.value = '';
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('study_portal_token');
//     localStorage.removeItem('study_portal_user');
//     navigate('/login');
//   };

//   // Show loading while checking authentication
//   if (!user && isAuthenticated === false) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading authentication...</p>
//       </div>
//     );
//   }

//   const currentBranchOptions = getCurrentBranchOptions();

//   return (
//     <div className="upload-container">
//       {/* Header */}
//       <div className="upload-header-row">
//         <header className="upload-header">
//           <h1 className="upload-title">📤 Upload Study Materials</h1>
//           <p className="upload-subtitle">
//             Share your notes, PYQs, and study materials with complete academic details
//           </p>
//         </header>
        
//         <button onClick={handleLogout} className="logout-button">
//           Logout
//         </button>
//       </div>

//       {/* User Info */}
//       <div className="user-info">
//         <div className="user-avatar">
//           {user?.name?.charAt(0)?.toUpperCase() || 'U'}
//         </div>
//         <div className="user-details">
//           <p className="user-name">
//             Uploading as: <span>{user?.name || 'User'}</span>
//           </p>
//           <p className="user-meta">
//             {user?.course || 'Course'} • {user?.branch || 'Branch'} • Semester {user?.semester || 'Semester'}
//           </p>
//           <p className="user-email">
//             {user?.email || 'Email not provided'}
//           </p>
//         </div>
//       </div>

//       {/* Info Box */}
//       <div className="info-box">
//         <p><strong>📋 Instructions:</strong> Fill all academic details accurately. This helps students find relevant materials.</p>
//         <p><small>✅ All subjects are fetched from your course data structure</small></p>
//       </div>

//       {/* File Upload Section */}
//       <div className="upload-box">
//         <input
//           type="file"
//           id="fileInput"
//           className="file-input"
//           onChange={handleFileChange}
//           accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
//         />
//         <label htmlFor="fileInput" className="upload-label">
//           📁 Choose File to Upload
//         </label>
        
//         {file && (
//           <div className="file-info">
//             <div className="file-info-row">
//               <span className="file-info-label">📄 File:</span>
//               <span className="file-info-value">{file.name}</span>
//             </div>
//             <div className="file-info-row">
//               <span className="file-info-label">📏 Size:</span>
//               <span className="file-info-value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
//             </div>
//             <div className="file-info-row">
//               <span className="file-info-label">📝 Type:</span>
//               <span className="file-info-value">{file.type}</span>
//             </div>
//           </div>
//         )}
        
//         <p className="file-types">
//           📎 <strong>Supported Formats:</strong> PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, JPEG, PNG
//           <br />
//           ⚠️ <strong>Maximum file size:</strong> 10MB
//         </p>
//       </div>

//       {/* Upload Form */}
//       <div className="upload-form">
//         <h3 className="form-section-title">📄 Material Details</h3>
        
//         {/* Title */}
//         <div className="form-group">
//           <label className="form-label">
//             Title <span className="required">*</span>
//             <small>(Descriptive title of your material)</small>
//           </label>
//           <input
//             type="text"
//             name="title"
//             placeholder="e.g., Complete Data Structures Notes, Operating Systems PYQ 2023"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="form-input"
//             required
//           />
//         </div>

//         {/* Description */}
//         <div className="form-group">
//           <label className="form-label">
//             Description <small>(Optional details about the material)</small>
//           </label>
//           <textarea
//             name="description"
//             placeholder="Describe what's included in this material, important topics covered, etc."
//             value={formData.description}
//             onChange={handleInputChange}
//             className="form-textarea"
//             rows="3"
//           />
//         </div>

//         <h3 className="form-section-title">🎓 Academic Details</h3>
        
//         <div className="form-row">
//           {/* Course */}
//           <div className="form-group half">
//             <label className="form-label">Course <span className="required">*</span></label>
//             <select
//               name="course"
//               value={formData.course}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               {courseOptions.map(course => (
//                 <option key={course.value} value={course.value}>
//                   {course.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Branch */}
//           <div className="form-group half">
//             <label className="form-label">Branch/Specialization <span className="required">*</span></label>
//             <select
//               name="branch"
//               value={formData.branch}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               {currentBranchOptions.map(branch => (
//                 <option key={branch} value={branch}>
//                   {branch}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           {/* Year */}
//           <div className="form-group half">
//             <label className="form-label">Year <span className="required">*</span></label>
//             <select
//               name="year"
//               value={formData.year}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               {yearOptions.map(year => (
//                 <option key={year} value={year}>Year {year}</option>
//               ))}
//             </select>
//           </div>

//           {/* Semester */}
//           <div className="form-group half">
//             <label className="form-label">Semester <span className="required">*</span></label>
//             <select
//               name="semester"
//               value={formData.semester}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               {semesterOptions.map(sem => (
//                 <option key={sem} value={sem}>Semester {sem}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Subject */}
//         <div className="form-group">
//           <label className="form-label">
//             Subject <span className="required">*</span>
//             <small>(Subjects fetched from your course data)</small>
//           </label>
//           <select
//             name="subject"
//             value={formData.subject}
//             onChange={handleInputChange}
//             className="form-select"
//             required
//           >
//             <option value="">-- Select Subject --</option>
//             {subjects.map(subject => (
//               <option key={subject.id} value={subject.displayName}>
//                 {subject.displayName}
//               </option>
//             ))}
//           </select>
//           {subjects.length === 1 && subjects[0].isCustom && (
//             <div className="form-info">
//               ℹ️ No predefined subjects found for this semester. Select "Other - Custom Subject" and enter subject name in Title.
//             </div>
//           )}
//         </div>

//         <div className="form-row">
//           {/* Subject Code (Auto-generated) */}
//           <div className="form-group half">
//             <label className="form-label">
//               Subject Code <small>(Auto-generated from course data)</small>
//             </label>
//             <input
//               type="text"
//               name="subject_code"
//               value={formData.subject_code}
//               readOnly
//               className="form-input"
//               style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
//             />
//           </div>

//           {/* Material Type */}
//           <div className="form-group half">
//             <label className="form-label">Material Type <span className="required">*</span></label>
//             <select
//               name="type"
//               value={formData.type}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               {materialTypes.map(type => (
//                 <option key={type.value} value={type.value}>
//                   {type.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Tags */}
//         <div className="form-group">
//           <label className="form-label">
//             Tags <small>(Comma separated, e.g., important, unit1, theory)</small>
//           </label>
//           <input
//             type="text"
//             name="tags"
//             placeholder="important, unit1, theory, practical, exam, lab"
//             value={formData.tags}
//             onChange={handleInputChange}
//             className="form-input"
//           />
//         </div>

//         {/* Summary Preview */}
//         {formData.subject && (
//           <div className="summary-preview">
//             <h4>📋 Upload Summary</h4>
//             <div className="summary-details">
//               <p><strong>Course:</strong> {formData.course}</p>
//               <p><strong>Branch:</strong> {formData.branch}</p>
//               <p><strong>Year/Semester:</strong> Year {formData.year}, Semester {formData.semester}</p>
//               <p><strong>Subject:</strong> {formData.subject}</p>
//               <p><strong>Subject Code:</strong> {formData.subject_code}</p>
//               <p><strong>Material Type:</strong> {materialTypes.find(t => t.value === formData.type)?.label || formData.type}</p>
//             </div>
//           </div>
//         )}

//         {/* Upload Button */}
//         <div className="upload-action">
//           <button
//             onClick={handleUpload}
//             disabled={uploading || !file || !formData.title || !formData.subject}
//             className="upload-btn"
//           >
//             {uploading ? (
//               <>
//                 <span className="spinner"></span>
//                 ⏳ Uploading...
//               </>
//             ) : (
//               '📤 Upload Material'
//             )}
//           </button>
          
//           <button
//             onClick={resetForm}
//             type="button"
//             className="reset-btn"
//           >
//             🔄 Reset Form
//           </button>
//         </div>

//         <div className="admin-note">
//           <div className="admin-note-icon">⚠️</div>
//           <div className="admin-note-content">
//             <strong>Important Note:</strong> All uploads require admin approval. 
//             Your file will be visible to students after review. 
//             Please ensure all academic details are accurate.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Upload;

