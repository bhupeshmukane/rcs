import api from './api';

export const authService = {

  studentLogin: async (studentId, dob) => {
    const response = await api.post('/auth/student/login', { studentId, dob });
    return response.data;
  },

  staffLogin: async (email, password) => {
    const response = await api.post('/auth/staff/login', { email, password });
    return response.data;
  },

  studentRegister: async (studentData) => {
    const response = await api.post('/auth/student/register', studentData);
    return response.data;
  },

  // 🔴 FIXED LOGOUT (CALL BACKEND)
  logout: async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      console.log("Logout API error", e);
    }

    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentRole: () => localStorage.getItem('role')
};

export default authService;
