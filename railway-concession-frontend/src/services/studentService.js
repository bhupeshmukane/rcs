import api from './api';

const studentService = {

  // ===============================
  // Get All Students
  // ===============================
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch students');
    }
  },

  // ===============================
  // Toggle Active / Inactive
  // ===============================
  toggleStudentStatus: async (id) => {
    try {
      const response = await api.put(`/students/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update status');
    }
  },

  // ===============================
  // Delete Single Student
  // ===============================
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete student');
    }
  },

  // ===============================
  // Bulk Delete Students
  // ===============================
  bulkDeleteStudents: async (ids) => {
    try {
      const response = await api.delete('/students/bulk-delete', {
        data: ids
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete students');
    }
  },

  // ===============================
  // Get Student By ID
  // ===============================
  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student');
    }
  },

  // ===============================
  // Get Student With Applications
  // ===============================
  getStudentWithApplications: async (id) => {
    try {
      const response = await api.get(`/students/${id}/with-applications`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student data');
    }
  },

  // ===============================
  // Update Student
  // ===============================
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update student');
    }
  },

  // ===============================
  // Search Students
  // ===============================
  searchStudents: async (query) => {
    try {
      const response = await api.get(`/students/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search students');
    }
  },

  deleteStudentsByYear: async (department, year) => {

    const response = await api.delete('/students/delete-by-year', {
      data: { department, year }
    });

    return response.data;
  } 

};

export default studentService;
