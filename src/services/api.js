export const API_URL = 'https://study-portal-ill8.onrender.com/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

//  HEALTH CHECK
export const checkHealth = async () => fetchAPI('/health');
export const healthCheck = async () => checkHealth();

//  AUTH APIs
export const register = async (userData) =>
  fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

export const login = async (email, password) =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getCurrentUser = async () => fetchAPI('/auth/profile');

//  COURSE APIs — real backend data only, no more mock fallback
export const getCourses = async () => fetchAPI('/programs');

// NOTE: backend has /api/courses/:id, not /api/programs/:id — using the real one
export const getCourseById = async (courseId) => {
  const res = await fetchAPI(`/courses/${courseId}`);
  return res.course;
};

export const getFeaturedCourses = async (limit = 6) => {
  const data = await getCourses();
  const programs = data.programs || [];
  return { courses: programs.slice(0, limit), total: programs.length };
};

//  YEARS — real subject + material counts, computed from actual DB rows
// instead of Math.random(). A "year" = 2 semesters (sem 1-2 = Year 1, etc).
export const getCourseYears = async (courseId) => {
  const [subjectsRes, notesRes] = await Promise.all([
    fetchAPI(`/subjects?course_id=${courseId}`),
    fetchAPI(`/notes?course_id=${courseId}`),
  ]);

  const subjects = subjectsRes.subjects || [];
  const notes = notesRes.notes || [];

  const materialsBySubject = {};
  notes.forEach((n) => {
    materialsBySubject[n.subject_id] = (materialsBySubject[n.subject_id] || 0) + 1;
  });

  const yearNames = { 1: 'First Year', 2: 'Second Year', 3: 'Third Year', 4: 'Final Year' };
  const years = {};

  subjects.forEach((s) => {
    const yearId = Math.ceil(s.semester / 2);
    if (!years[yearId]) {
      years[yearId] = { id: yearId, name: yearNames[yearId] || `Year ${yearId}`, subjects: 0, materials: 0 };
    }
    years[yearId].subjects += 1;
    years[yearId].materials += materialsBySubject[s.id] || 0;
  });

  return Object.values(years).sort((a, b) => a.id - b.id);
};

//  SEMESTERS — real subject counts per semester, not a hardcoded "6, credits: 24"
export const getSemestersForYear = async (courseId, yearId) => {
  const subjectsRes = await fetchAPI(`/subjects?course_id=${courseId}`);
  const subjects = subjectsRes.subjects || [];

  const semA = (yearId * 2) - 1;
  const semB = yearId * 2;

  return [semA, semB].map((sem) => ({
    id: sem,
    name: `Semester ${sem}`,
    subjects: subjects.filter((s) => s.semester === sem).length,
  }));
};

//  SUBJECT APIs — hits real /api/subjects directly.
// (Old code called /programs/:id/branches -> /branches/:id/subjects, a route
// that never existed on the backend — that's why it always silently fell
// back to fake subjects before. Fixed to use the real endpoint.)
export const getSubjectsForSemester = async (courseId, yearId, semesterId) => {
  const response = await fetchAPI(`/subjects?course_id=${courseId}&semester=${semesterId}`);
  return response.subjects || [];
};

export const getSubjectsByCourse = async (courseId, semester = null) => {
  const url = semester
    ? `/subjects?course_id=${courseId}&semester=${semester}`
    : `/subjects?course_id=${courseId}`;
  return fetchAPI(url);
};

// Needs a new backend route — see courses.py patch below
export const getSubject = async (subjectId) => {
  const res = await fetchAPI(`/subjects/${subjectId}`);
  return res.subject;
};

//  MATERIAL APIs — real data, empty result instead of fake notes on failure
export const getMaterials = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.subject_id) params.append('subject_id', filters.subject_id);
  if (filters.course_id) params.append('course_id', filters.course_id);
  if (filters.material_type) params.append('material_type', filters.material_type);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = queryString ? `/notes?${queryString}` : '/notes';
  return fetchAPI(url);
};

export const getMaterialsForSubject = async (subjectId) => getMaterials({ subject_id: subjectId });

export const getMaterial = async (materialId) => {
  const res = await fetchAPI(`/notes/${materialId}`);
  return res.note;
};

//  FILE UPLOAD
export const uploadMaterial = async (formData) => {
  const token = localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Upload failed: ${response.status}`);
  }
  return response.json();
};

//  FILE DOWNLOAD
export const downloadMaterial = async (materialId, filename) => {
  const token = localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');

  const response = await fetch(`${API_URL}/notes/${materialId}/download`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `material_${materialId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true };
};

//  SEARCH — uses the real Postgres full-text search endpoint
export const searchNotes = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query });
  if (filters.course_id) params.append('course_id', filters.course_id);
  if (filters.subject_id) params.append('subject_id', filters.subject_id);

  const response = await fetchAPI(`/search?${params.toString()}`);
  return {
    query,
    notes: response.notes || [],
    total: response.total || 0,
    fuzzy: response.fuzzy || false,
  };
};

export const searchMaterials = async (query, filters = {}) => {
  const response = await getMaterials({ search: query, ...filters });
  return { query, results: response.notes || [], total: response.total || 0 };
};

//  USER DOWNLOADS
export const getUserDownloads = async () => {
  const response = await fetchAPI('/my-uploads');
  return response.uploads || [];
};

export const getNotes = async () => getMaterials();

//  RATING — wired to the real /api/notes/:id/rate + /user-rating endpoints
// (these already existed on the backend; frontend was just stubbing fake success)
export const rateMaterial = async (noteId, rating) =>
  fetchAPI(`/notes/${noteId}/rate`, { method: 'POST', body: JSON.stringify({ rating }) });

export const getUserRatingForNote = async (noteId) => fetchAPI(`/notes/${noteId}/user-rating`);

//  BOOKMARKS — backend has no bookmarks table/routes yet, so these throw
// clearly instead of silently pretending to succeed. Wire these up once
// the backend bookmarks feature exists.
export const addBookmark = async () => {
  throw new Error('Bookmarks are not implemented on the backend yet');
};
export const removeBookmark = async () => {
  throw new Error('Bookmarks are not implemented on the backend yet');
};
export const getUserBookmarks = async () => {
  throw new Error('Bookmarks are not implemented on the backend yet');
};

//  DATABASE INFO / STATS — real admin stats, zeros instead of fake numbers on failure
export const getDBInfo = async () => {
  const response = await fetchAPI('/admin/stats');
  return {
    tables: {
      notes: response.stats?.total_notes || 0,
      pyqs: response.stats?.notes_by_type?.pyq || 0,
      courses: response.stats?.total_programs || 0,
      downloads: response.stats?.total_downloads || 0,
      subjects: response.stats?.total_subjects || 0,
      users: response.stats?.total_users || 0,
    },
  };
};

export const getStats = async () => {
  const dbInfo = await getDBInfo();
  return {
    totalNotes: dbInfo.tables.notes,
    totalPYQs: dbInfo.tables.pyqs,
    totalCourses: dbInfo.tables.courses,
    totalDownloads: dbInfo.tables.downloads,
    totalSubjects: dbInfo.tables.subjects,
    totalUsers: dbInfo.tables.users,
  };
};

//  DEFAULT EXPORT
const api = {
  register,
  login,
  getCurrentUser,
  getCourses,
  getCourseById,
  getFeaturedCourses,
  getCourseYears,
  getSemestersForYear,
  getSubjectsForSemester,
  getSubjectsByCourse,
  getSubject,
  getMaterials,
  getMaterialsForSubject,
  getMaterial,
  searchMaterials,
  searchNotes,
  uploadMaterial,
  downloadMaterial,
  getUserDownloads,
  getNotes,
  rateMaterial,
  getUserRatingForNote,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getDBInfo,
  getStats,
  healthCheck,
  checkHealth,
};

export default api;