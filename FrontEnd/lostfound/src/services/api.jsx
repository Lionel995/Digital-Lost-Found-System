import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8081', // Adjust this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiService = {
  // Lost Items
  getAllLostItems: () => api.get('/lostItem/getAllLostItems'),
  getLostItemById: (id) => api.get(`/lostItem/getLostItemById/${id}`),
  saveLostItem: (formData) => api.post('/lostItem/saveLostItem', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLostItem: (id) => api.delete(`/lostItem/deleteLostItem/${id}`),

  // Found Items
  getAllFoundItems: () => api.get('/foundItems/getAll'),
  getFoundItemById: (id) => api.get(`/foundItems/getFoundItemById/${id}`),
  saveFoundItem: (formData) => api.post('/foundItems/saveFoundItem', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateFoundItem: (id, formData) => api.put(`/foundItems/updateFoundItem/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFoundItem: (id) => api.delete(`/foundItems/deleteFoundItem/${id}`),

  // Claim Requests
  getAllClaimRequests: () => api.get('/claimRequests/all'),
  getClaimRequestById: (id) => api.get(`/claimRequests/getClaimById/${id}`),
  createClaimRequest: (claimData, lostItemId, foundItemId) => {
    const params = new URLSearchParams();
    if (lostItemId) params.append('lostItemId', lostItemId);
    if (foundItemId) params.append('foundItemId', foundItemId);
    return api.post(`/claimRequests/create?${params.toString()}`, claimData);
  },
  updateClaimStatus: (id, status) => api.put(`/claimRequests/ClaimVerification/${id}/status?status=${status}`),
  deleteClaimRequest: (id) => api.delete(`/claimRequests/delete/${id}`),
  rollbackClaimDecision: (id) => api.put(`/claimRequests/rollback/${id}`),
  getClaimsByStatus: (status) => api.get(`/claimRequests/claimsByStatus?status=${status}`),
  getMyClaimRequests: () => api.get('/claimRequests/my-claims'),

  // Users
  getAllUsers: () => api.get('/users/all'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  saveUser: (userData) => api.post('/users/save', userData),
  updateUser: (id, userData) => api.put(`/users/update/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/delete/${id}`),
};

export default api;