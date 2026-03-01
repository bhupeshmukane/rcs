import api from './api';

const applicationService = {

  // ===============================
  // STAFF: Get All Applications
  // ===============================
  getAllApplications: async () => {
    try {
      const response = await api.get(
        '/applications/staff/applications',
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch applications'
      );
    }
  },

  // ===============================
  // Get Application By ID
  // ===============================
  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch application'
      );
    }
  },

  // ===============================
  // Get Application With Student
  // ===============================
  getApplicationWithStudent: async (id) => {
    try {
      const response = await api.get(`/applications/${id}/with-student`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch application with student'
      );
    }
  },

  // ===============================
  // Create New Application (Multipart)
  // ===============================
  createApplication: async (formData) => {
    try {
      const response = await api.post(
        '/applications',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to create application'
      );
    }
  },

  // ===============================
  // STAFF: Update Application Status
  // ===============================
  updateApplicationStatus: async (id, status) => {
    try {
      const response = await api.put(
        `/applications/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to update application status'
      );
    }
  },

  // ===============================
  // STAFF: Assign Certificate Number
  // ===============================
  assignCertificateNumber: async (id, certificateNo) => {
    try {
      const response = await api.put(
        `/applications/${id}/certificate`,
        { certificateNo }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to assign certificate number'
      );
    }
  },

  // ===============================
  // STUDENT: Get Applications By Student ID
  // ===============================
  getApplicationsByStudentId: async (studentId) => {
    try {
      const response = await api.get(
        `/applications/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch student applications'
      );
    }
  },

  // ===============================
  // Get Applications By Status
  // ===============================
  getApplicationsByStatus: async (status) => {
    try {
      const response = await api.get(
        `/applications/status/${status}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch applications by status'
      );
    }
  },

  // ===============================
  // Get Application Statistics
  // ===============================
  getApplicationStats: async () => {
    try {
      const response = await api.get('/applications/stats');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch application statistics'
      );
    }
  },

  // ===============================
  // Get Application Validity
  // ===============================
  getApplicationValidity: async (appId) => {
    try {
      const response = await api.get(
        `/applications/${appId}/validity`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch application validity'
      );
    }
  },

  // ===============================
  // STAFF: Get Caste Certificate Path
  // ===============================
  getCasteCertificate: async (applicationId) => {
    try {
      const response = await api.get(
        `/applications/${applicationId}/caste-certificate`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        'Failed to fetch caste certificate'
      );
    }
  }

};

export default applicationService;