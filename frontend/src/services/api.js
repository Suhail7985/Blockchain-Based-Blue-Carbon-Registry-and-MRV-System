import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
  timeout: 10000,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const sendOTP = async (email) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const completeRegistration = async (email, name, password) => {
  const response = await api.post('/auth/register', {
    email,
    name,
    password,
  });
  return response.data;
};

export const login = async (email, password, rememberMe) => {
  const response = await api.post('/auth/login', {
    email,
    password,
    rememberMe,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Profile
export const getProfile = () => api.get('/profile').then((r) => r.data);
export const updateProfile = (data) => api.patch('/profile', data).then((r) => r.data);
export const uploadLandDocument = (formData) => api.put('/profile/land-document', formData).then((r) => r.data);

// Plantation
export const getVerifiedLands = () => api.get('/plantation/lands').then((r) => r.data);
export const getMyPlantations = () => api.get('/plantation').then((r) => r.data);
export const submitPlantation = (formData) => api.post('/plantation', formData).then((r) => r.data);

// Carbon
export const getCarbonSummary = () => api.get('/carbon').then((r) => r.data);

// Panchayat
export const getPanchayatPlantations = (status) =>
  api.get('/panchayat/plantations', { params: status ? { status } : {} }).then((r) => r.data);
export const panchayatApprovePlantation = (id, remarks) =>
  api.patch(`/panchayat/plantations/${id}/approve`, { remarks }).then((r) => r.data);
export const panchayatRejectPlantation = (id, reason) =>
  api.patch(`/panchayat/plantations/${id}/reject`, { reason }).then((r) => r.data);

// Panchayat - Manual KYC queue
export const getPanchayatManualKyc = () => api.get('/panchayat/kyc/manual-review').then((r) => r.data);
export const panchayatApproveManualKyc = (userId, notes) =>
  api.patch(`/panchayat/kyc/${userId}/approve`, { notes }).then((r) => r.data);
export const panchayatRejectManualKyc = (userId, reason) =>
  api.patch(`/panchayat/kyc/${userId}/reject`, { reason }).then((r) => r.data);

// NGO - Manual KYC queue
export const getNgoManualKyc = () => api.get('/ngo/kyc/manual-review').then((r) => r.data);
export const ngoApproveManualKyc = (userId, notes) =>
  api.patch(`/ngo/kyc/${userId}/approve`, { notes }).then((r) => r.data);
export const ngoRejectManualKyc = (userId, reason) =>
  api.patch(`/ngo/kyc/${userId}/reject`, { reason }).then((r) => r.data);

// NCCR Admin
export const getAdminPlantations = (status) =>
  api.get('/admin/plantations', { params: status ? { status } : {} }).then((r) => r.data);
export const nccrApprovePlantation = (id, notes) =>
  api.patch(`/admin/plantations/${id}/approve`, { notes }).then((r) => r.data);
export const nccrRejectPlantation = (id, notes) =>
  api.patch(`/admin/plantations/${id}/reject`, { notes }).then((r) => r.data);

export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data);
export const getAdminAnalytics = () => api.get('/admin/analytics').then((r) => r.data);
export const getAuditLogs = (limit = 50) =>
  api.get('/admin/audit-logs', { params: { limit } }).then((r) => r.data);
export const getCarbonSettings = () => api.get('/admin/settings/carbon').then((r) => r.data);
export const updateCarbonSettings = (payload) =>
  api.put('/admin/settings/carbon', payload).then((r) => r.data);
export const getPanchayats = () => api.get('/admin/panchayats').then((r) => r.data);
export const createPanchayat = (payload) => api.post('/admin/panchayats', payload).then((r) => r.data);
export const makeUserPanchayat = (userId, payload) =>
  api.patch(`/admin/users/${userId}/make-panchayat`, payload).then((r) => r.data);

export default api;
