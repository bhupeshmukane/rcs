import api from './api';

const auditService = {

  getAllLogs: async () => {
    try {
      const response = await api.get('/audit');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch audit logs'
      );
    }
  }

};

export default auditService;