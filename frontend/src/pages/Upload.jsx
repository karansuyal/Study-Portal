// src/pages/Upload.jsx
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
  const [youtubeUrl, setYoutubeUrl] = useState('');
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
  
  const branchOptions = ['CSE', 'Computer Applications', 'General'];
  const yearOptions = ['1', '2', '3', '4'];
  
  // Semester options based on year
  const getSemesterOptions = (year) => {
    switch(year) {
      case '1':
        return ['1', '2'];
      case '2':
        return ['3', '4'];
      case '3':
        return ['5', '6'];
      case '4':
        return ['7', '8'];
      default:
        return ['1'];
    }
  };
  
  const materialTypes = [
    { value: 'notes', label: '📄 Notes', requiresFile: true },
    { value: 'pyq', label: '📝 Previous Year Questions (PYQ)', requiresFile: true },
    { value: 'syllabus', label: '📋 Syllabus', requiresFile: true },
    { value: 'lab', label: '🔬 Lab Manuals', requiresFile: true },
    { value: 'youtube', label: '🎥 YouTube Videos', requiresFile: false, requiresUrl: true },
    { value: 'presentation', label: '📊 Presentations', requiresFile: true },
    { value: 'important', label: '❓ Important Questions', requiresFile: true },
    { value: 'project', label: '📁 Project Report', requiresFile: true },
    { value: 'book', label: '📚 Reference Book', requiresFile: true }
  ];

  // Get current material type config
  const currentMaterialType = materialTypes.find(t => t.value === formData.type);

  // ✅ FIXED: Clean YouTube URL - remove tracking parameters
  const cleanYoutubeUrl = (url) => {
    if (!url) return '';
    // Remove ?si=, &si=, &t=, etc. parameters
    return url.split('?')[0].split('&')[0];
  };

  // ✅ FIXED: Extract YouTube video ID
  const extractYoutubeId = (url) => {
    if (!url) return null;
    
    const cleanUrl = cleanYoutubeUrl(url);
    
    // Match YouTube video ID (11 characters: letters, numbers, underscore, hyphen)
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If direct ID is provided (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    
    return null;
  };

  // ✅ FIXED: Validate YouTube URL
  const validateYoutubeUrl = (url) => {
    if (!url) return false;
    return extractYoutubeId(url) !== null;
  };

  // ✅ FIXED: Get YouTube thumbnail URL
  const getYoutubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Course ID mapping
  const getCourseIdFromName = (courseName) => {
    const courseMap = {
      'B.Tech': 1,    
      'BCA': 2,       
      'BBA': 3,       
      'MBA': 4,       
      'MCA': 5        
    };
    return courseMap[courseName] || 1;  
  };

  // Get course folder name
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

  // Get branch options based on course
  const getBranchOptions = (course) => {
    const branchMap = {
      'B.Tech': ['CSE'],
      'BCA': ['Computer Applications'],
      'BBA': ['General'],
      'MCA': ['Computer Applications'],
      'MBA': ['General']
    };
    return branchMap[course] || ['CSE'];
  };

  // Get subjects from coursesData
  const getSubjectsFromCourseData = (courseName, year, semester) => {
    try {
      const courseId = getCourseIdFromName(courseName);
      if (!courseId) return [];
      
      const course = coursesData[courseId];
      if (!course || !course.years[year] || !course.years[year].semesters[semester]) {
        return [];
      }
      
      const subjectsList = course.years[year].semesters[semester];
      
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
    
    fetchCoursesFromBackend();
  }, [navigate]);

  useEffect(() => {
    updateSubjects();
  }, [formData.course, formData.year, formData.semester]);

  useEffect(() => {
    const newBranchOptions = getBranchOptions(formData.course);
    if (!newBranchOptions.includes(formData.branch)) {
      setFormData(prev => ({ ...prev, branch: newBranchOptions[0] }));
    }
  }, [formData.course]);

  useEffect(() => {
    const semesterOptions = getSemesterOptions(formData.year);
    if (!semesterOptions.includes(formData.semester)) {
      setFormData(prev => ({ 
        ...prev, 
        semester: semesterOptions[0]
      }));
    }
  }, [formData.year]);

  const fetchCoursesFromBackend = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch(`${API_URL}/courses`);
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const updateSubjects = () => {
    const { course, year, semester } = formData;
    
    let availableSubjects = [];
    const subjectsFromDB = getSubjectsFromCourseData(course, year, semester);
    
    if (subjectsFromDB.length > 0) {
      availableSubjects = subjectsFromDB;
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
    
    const selectedSubject = subjects.find(s => s.displayName === subject);
    
    if (selectedSubject && !selectedSubject.isCustom) {
      setFormData(prev => ({ ...prev, subject_code: selectedSubject.code }));
    } else {
      setFormData(prev => ({ ...prev, subject_code: 'CUSTOM' }));
    }
  };

  const getCurrentBranchOptions = () => {
    return getBranchOptions(formData.course);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('❌ File size exceeds 10MB limit');
        e.target.value = '';
        return;
      }
      
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

  // ✅ FIXED: Handle YouTube URL change with cleaning
  const handleYoutubeUrlChange = (e) => {
    let url = e.target.value;
    
    if (url) {
      // Clean the URL
      const cleanUrl = cleanYoutubeUrl(url);
      const videoId = extractYoutubeId(cleanUrl);
      
      if (videoId) {
        console.log('✅ Valid YouTube URL, Video ID:', videoId);
        // Update with cleaned URL
        setYoutubeUrl(cleanUrl);
      } else {
        setYoutubeUrl(url);
        if (formData.type === 'youtube' && url.trim()) {
          alert('⚠️ Please enter a valid YouTube URL');
        }
      }
    } else {
      setYoutubeUrl('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'course') {
      const newBranchOptions = getBranchOptions(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        branch: newBranchOptions[0],
        subject: '',
        subject_code: ''
      }));
    } else if (name === 'subject') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
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

  const handleUpload = async () => {
    // Validation based on material type
    if (formData.type === 'youtube') {
      // YouTube video validation
      if (!youtubeUrl.trim()) {
        alert('❌ Please enter YouTube video URL');
        return;
      }
      
      const videoId = extractYoutubeId(youtubeUrl);
      if (!videoId) {
        alert('❌ Invalid YouTube URL. Please enter a valid YouTube link.');
        return;
      }
    } else {
      // File upload validation
      if (!file) {
        alert('❌ Please select a file');
        return;
      }
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

      const selectedSubject = subjects.find(s => s.displayName === formData.subject);
      
      let subjectId = null;
      let subjectName = formData.subject;
      let subjectCode = formData.subject_code;
      
      if (selectedSubject) {
        if (!selectedSubject.isCustom) {
          subjectId = selectedSubject.id;
          subjectName = selectedSubject.name;
          subjectCode = selectedSubject.code;
        }
      }
      
      const courseId = getCourseIdFromName(formData.course);
      const courseFolder = getCourseFolderName(formData.course);
      
      let uploadData = new FormData();
      
      // Common fields
      uploadData.append('title', formData.title);
      uploadData.append('course_id', courseId.toString());
      uploadData.append('subject_id', subjectId ? subjectId.toString() : '');
      uploadData.append('subject', subjectName);
      uploadData.append('subject_code', subjectCode || '');
      uploadData.append('type', formData.type);
      uploadData.append('semester', formData.semester);
      uploadData.append('year', formData.year);
      uploadData.append('tags', formData.tags || '');
      
      // Handle YouTube video separately
      if (formData.type === 'youtube') {
        const videoId = extractYoutubeId(youtubeUrl);
        const thumbnailUrl = getYoutubeThumbnail(videoId);
        
        console.log('🎥 YouTube Upload:', { videoId, thumbnailUrl });
        
        // Send YouTube data
        const youtubeData = {
          isYouTube: true,
          videoId: videoId,
          videoUrl: youtubeUrl,
          thumbnailUrl: thumbnailUrl,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          description: formData.description || ''
        };
        
        uploadData.append('is_youtube', 'true');
        uploadData.append('youtube_url', youtubeUrl);
        uploadData.append('youtube_id', videoId);
        uploadData.append('description', JSON.stringify(youtubeData));
      } else {
        // File upload
        uploadData.append('file', file);
        
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
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      if (response.ok) {
        if (formData.type === 'youtube') {
          alert(`✅ YouTube video added successfully!\n\n` +
            `🎥 Video: ${formData.title}\n` +
            `🎓 Course: ${formData.course}\n` +
            `📚 Subject: ${subjectName}\n\n` +
            `⚠️ Note: Video will be visible after admin approval.`);
        } else {
          alert(`✅ ${result.message || 'File uploaded successfully!'}\n\n` +
            `📝 Status: ${result.status || 'Pending approval'}\n\n` +
            `🎓 Course: ${formData.course}\n` +
            `📚 Subject: ${subjectName}\n` +
            `📖 Year: ${formData.year}, Semester: ${formData.semester}\n\n` +
            `⚠️ Note: File will be visible after admin approval.`);
        }
        
        resetForm();
        
      } else {
        let errorMsg = result.error || 'Server error';
        
        if (response.status === 401) {
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
    setYoutubeUrl('');
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

  if (!user && isAuthenticated === false) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading authentication...</p>
      </div>
    );
  }

  const currentBranchOptions = getCurrentBranchOptions();
  const isYouTubeType = formData.type === 'youtube';
  const currentVideoId = isYouTubeType && youtubeUrl ? extractYoutubeId(youtubeUrl) : null;

  return (
    <div className="upload-container">
      <div className="upload-header-row">
        <header className="upload-header">
          <h1 className="upload-title">📤 Upload Study Materials</h1>
          <p className="upload-subtitle">
            Share your notes, PYQs, YouTube videos, and study materials
          </p>
        </header>
        
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

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

      <div className="info-box">
        <p><strong>📋 Instructions:</strong> Fill all academic details accurately.</p>
        <p><small>✅ For YouTube videos: Just paste the video URL</small></p>
      </div>

      {/* File/URL Upload Section */}
      <div className="upload-box">
        {isYouTubeType ? (
          // YouTube URL Input
          <>
            <div className="youtube-input-wrapper">
              <label className="youtube-label">🎥 YouTube Video URL</label>
              <input
                type="url"
                className="youtube-input"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={youtubeUrl}
                onChange={handleYoutubeUrlChange}
              />
              <p className="youtube-hint">
                💡 Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...
              </p>
            </div>
            
            {currentVideoId && (
              <div className="youtube-preview">
                <p>✅ Valid YouTube URL</p>
                <div className="youtube-thumbnail-preview">
                  <img 
                    src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`}
                    alt="Video thumbnail preview"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
                    }}
                  />
                  <p className="video-id-hint">Video ID: {currentVideoId}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          // File Upload
          <>
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
              </div>
            )}
            
            <p className="file-types">
              📎 <strong>Supported Formats:</strong> PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, JPEG, PNG
              <br />
              ⚠️ <strong>Maximum file size:</strong> 10MB
            </p>
          </>
        )}
      </div>

      {/* Upload Form */}
      <div className="upload-form">
        <h3 className="form-section-title">📄 Material Details</h3>
        
        <div className="form-group">
          <label className="form-label">
            Title <span className="required">*</span>
            <small>(Descriptive title of your material)</small>
          </label>
          <input
            type="text"
            name="title"
            placeholder={isYouTubeType ? "e.g., Complete Data Structures Playlist, Operating Systems Tutorial" : "e.g., Complete Data Structures Notes, Operating Systems PYQ 2023"}
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Description <small>(Details about the material)</small>
          </label>
          <textarea
            name="description"
            placeholder={isYouTubeType ? "Describe what the video covers, important topics, etc." : "Describe what's included in this material, important topics covered, etc."}
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
          />
        </div>

        <h3 className="form-section-title">🎓 Academic Details</h3>
        
        <div className="form-row">
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

          <div className="form-group half">
            <label className="form-label">Semester <span className="required">*</span></label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {getSemesterOptions(formData.year).map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

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
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label className="form-label">
              Subject Code <small>(Auto-generated)</small>
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

        {formData.subject && (
          <div className="summary-preview">
            <h4>📋 Upload Summary</h4>
            <div className="summary-details">
              <p><strong>Course:</strong> {formData.course}</p>
              <p><strong>Branch:</strong> {formData.branch}</p>
              <p><strong>Year/Semester:</strong> Year {formData.year}, Semester {formData.semester}</p>
              <p><strong>Subject:</strong> {formData.subject}</p>
              <p><strong>Material Type:</strong> {currentMaterialType?.label || formData.type}</p>
              {isYouTubeType && currentVideoId && (
                <p><strong>🎥 YouTube Video ID:</strong> {currentVideoId}</p>
              )}
            </div>
          </div>
        )}

        <div className="upload-action">
          <button
            onClick={handleUpload}
            disabled={uploading || (!isYouTubeType && !file) || (isYouTubeType && !youtubeUrl) || !formData.title || !formData.subject}
            className="upload-btn"
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                ⏳ Uploading...
              </>
            ) : (
              isYouTubeType ? '🎥 Add YouTube Video' : '📤 Upload Material'
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
            Your content will be visible to students after review.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;