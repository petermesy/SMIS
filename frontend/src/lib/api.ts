// Change password for logged-in user
export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await api.post('/users/change-password', { oldPassword, newPassword });
  return res.data;
}
// Get all grade entries (student scores, not grade levels)
export async function getGrades() {
  try {
    const res = await api.get('/grades');
    return res.data;
  } catch (err: any) {
    console.error('getGrades error:', err.response?.data || err.message);
    throw err;
  }
}
// Get all grades for a class, subject, category, semester (for teacher view)
// export async function getClassGrades(params: { classId: string; subjectId: string; categoryId?: string; semesterId?: string; academicYearId?: string }) {
//   try {
//     const res = await api.get('/grades/class/all', { params });
//     console.log('getClassGrades response:', res.data);
//     return res.data;
//   } catch (err) {
//     console.error('getClassGrades error:', err);
//     throw err;
//   }
// }


function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export const getClassGrades = async (params: {
  classId: string;
  subjectId: string;
  categoryId?: string;
  semesterId?: string;
  academicYearId?: string;
}) => {
  const queryString = new URLSearchParams();
  
  // Required params
  queryString.append('classId', params.classId);
  queryString.append('subjectId', params.subjectId);
  
  // Optional params
  if (params.categoryId) queryString.append('categoryId', params.categoryId);
  if (params.semesterId) queryString.append('semesterId', params.semesterId);
  if (params.academicYearId) queryString.append('academicYearId', params.academicYearId);

  const response = await fetch(`/api/grades/class/all?${queryString.toString()}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch class grades');
  }

  return response.json();
};


// Get all grade levels with their sections (for schedule dropdowns)
export async function getGradeLevelsWithSections() {
  try {
    const res = await api.get('/grades/levels-with-sections');
    return res.data;
  } catch (err: any) {
    console.error('getGradeLevelsWithSections error:', err.response?.data || err.message);
    throw err;
  }
}





// Grade Categories (Exam Types)
// Get all grade categories for a class and subject (optionally pass classId)
export async function getGradeCategories(params: { classId: string; subjectId: string }) {
  const { classId, subjectId } = params;
  // Prefer backend endpoint that supports both classId and subjectId as query params
  const res = await api.get(`/grades/categories/${subjectId}`, { params: { classId } });
  return res.data;
}

export async function createGradeCategory(data: any) {
  const res = await api.post('/grades/categories', data);
  return res.data;
}
// Get all classes
export async function getClasses() {
  const res = await api.get('/classes');
  return res.data;
}
// Assign a teacher to a class
export async function assignTeacherToClass(
  classId: string,
  data: { teacherId: string; subjectId: string; academicYearId: string; semesterId?: string }
) {
  const res = await api.post(`/classes/${classId}/assign-teacher`, data);
  return res.data;
}

// Assign a student to a class
export async function assignStudentToClass(
  classId: string,
  data: { studentId: string; academicYearId: string; semesterId?: string }
) {
  const res = await api.post(`/classes/${classId}/assign-student`, data);
  return res.data;
}
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Attaching token:', token); // Debug log
  if (token && config.headers) {
    if (typeof config.headers.set === 'function') {
      // AxiosHeaders instance
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Plain object
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function logout() {
  // Optionally call backend logout endpoint
  localStorage.removeItem('token');
}

// Attendance APIs
export async function getTeacherAssignments() {
  const res = await api.get('/teacher-assignments');
  return res.data;
}

// Get students by class, with optional academicYearId and semesterId filters
export async function getStudentsByClass(classId: string, params?: { academicYearId?: string; semesterId?: string }) {
  const res = await api.get(`/classes/${classId}/students`, { params });
  return res.data;
}

export async function getAttendance(classId: string, date: string) {
  const res = await api.get(`/attendance/${classId}/${date}`);
  return res.data;
}

export async function markAttendance(payload: {
  studentId: string;
  classId: string;
  subjectId: string;
  date: string;
  period: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}) {
  const res = await api.post('/attendance', payload);
  return res.data;
}

export async function getAttendanceStats(classId: string, period: string) {
  const res = await api.get(`/attendance/stats/${classId}/${period}`);
  return res.data;
}

export async function getAttendanceReports() {
  const res = await api.get('/attendance/reports');
  return res.data;
}

// Subjects
export async function getSubjects() {
  const res = await api.get('/subjects');
  return res.data;
}
export async function createSubject(data: any) {
  const res = await api.post('/subjects', data);
  return res.data;
}
export async function updateSubject(id: string, data: any) {
  const res = await api.put(`/subjects/${id}`, data);
  return res.data;
}
export async function deleteSubject(id: string) {
  const res = await api.delete(`/subjects/${id}`);
  return res.data;
}
// Grades
// export async function getGrades() {
//   const res = await api.get('/grades');
//   return res.data;
// }
// Update grade
export async function updateGrade(id: string, data: any) {
  const res = await api.put(`/grades/${id}`, data); // Removed /api prefix
  return res.data;
}

// Delete grade
export async function deleteGrade(id: string) {
  const res = await api.delete(`/grades/${id}`); // Removed /api prefix
  return res.data;
}

// Create grade
export async function createGrade(data: any) {
  const res = await api.post('/grades', data); // Removed /api prefix
  return res.data;
}
// Exams
export async function getExams() {
  const res = await api.get('/exams');
  return res.data;
}
export async function createExam(data: any) {
  const res = await api.post('/exams', data);
  return res.data;
}
export async function updateExam(id: string, data: any) {
  const res = await api.put(`/exams/${id}`, data);
  return res.data;
}
export async function deleteExam(id: string) {
  const res = await api.delete(`/exams/${id}`);
  return res.data;
}
// Users
export async function getUsers(params?: any) {
  const res = await api.get('/users', { params });
  return res.data;
}
export async function getUser(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}
export async function createUser(data: any) {
  const res = await api.post('/users', data);
  return res.data;
}
export async function updateUser(id: string, data: any) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}
export async function deleteUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}
// Documents
export async function getDocuments(params?: any) {
  const res = await api.get('/documents', { params });
  return res.data;
}
export async function uploadDocument(formData: FormData) {
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
export async function downloadDocument(id: string) {
  const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
  return res.data;
}
export async function deleteDocument(id: string) {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
}
// Communications
export async function getAnnouncements() {
  const res = await api.get('/announcements');
  return res.data;
}
export async function createAnnouncement(data: any) {
  const res = await api.post('/announcements', data);
  return res.data;
}
export async function getMessages() {
  const res = await api.get('/messages');
  return res.data;
}
export async function sendMessage(data: any) {
  const res = await api.post('/messages', data);
  return res.data;
}
export async function markMessageRead(id: string) {
  const res = await api.put(`/messages/${id}/read`);
  return res.data;
}
export async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}
// Class Scheduling
export async function getSchedules(classId: string) {
  const res = await api.get(`/schedules/${classId}`);
  return res.data;
}
export async function createSchedule(data: any) {
  const res = await api.post('/schedules', data);
  return res.data;
}
export async function updateSchedule(id: string, data: any) {
  const res = await api.put(`/schedules/${id}`, data);
  return res.data;
}
export async function deleteSchedule(id: string) {
  const res = await api.delete(`/schedules/${id}`);
  return res.data;
}
// Academic Years
export async function getAcademicYears() {
  const res = await api.get('/academic-years');
  return res.data;
}
export async function createAcademicYear(data: any) {
  const res = await api.post('/academic-years', data);
  return res.data;
}
// Semesters
export async function getSemesters() {
  const res = await api.get('/semesters');
  return res.data;
}
export async function createSemester(data: any) {
  const res = await api.post('/semesters', data);
  return res.data;
}
