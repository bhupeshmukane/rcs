import api from './api';

const authService = {

  // =========================
  // STUDENT - Request OTP
  // =========================
  requestStudentOtp: async (studentId, dob) => {
    const response = await api.post(
      '/auth/student/request-otp',
      { studentId, dob },
      { withCredentials: true }
    );

    return response.data;
  },

  // =========================
  // STUDENT - Verify OTP
  // =========================
  verifyStudentOtp: async (studentId, otp) => {
    const response = await api.post(
      '/auth/student/verify-otp',
      { studentId, otp },
      { withCredentials: true }
    );

    return response.data;
  },

  // =========================
  // STAFF LOGIN
  // =========================
  staffLogin: async (email, password) => {
    const response = await api.post(
      '/auth/staff/login',
      { email, password },
      { withCredentials: true }
    );

    return response.data;
  },

  // =========================
  // GET CURRENT SESSION USER
  // =========================
  getCurrentUser: async () => {
    const response = await api.get(
      '/auth/me',
      { withCredentials: true }
    );

    return response.data;
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    await api.post(
      '/auth/logout',
      {},
      { withCredentials: true }
    );
  }

};

export default authService;