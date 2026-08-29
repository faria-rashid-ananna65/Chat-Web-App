import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
}

// Friends API
export const friendsAPI = {
  getFriends: () => api.get('/api/friends'),
  getPendingRequests: () => api.get('/api/friends/requests'),
  sendRequest: (email) =>
    api.post('/api/friends/request', { email }),
  acceptRequest: (requestId) =>
    api.put('/api/friends/accept', { requestId }),
  rejectRequest: (requestId) =>
    api.put('/api/friends/reject', { requestId }),
  removeFriend: (friendId) =>
    api.delete('/api/friends/remove', { data: { friendId } }),
}

// Groups API
export const groupsAPI = {
  getGroups: () => api.get('/api/groups'),
  getGroup: (groupId) => api.get(`/api/groups/${groupId}`),
  createGroup: (data) => api.post('/api/groups', data),
  updateGroup: (groupId, data) => api.put(`/api/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/api/groups/${groupId}`),
  addMembers: (groupId, members) =>
    api.put(`/api/groups/${groupId}/add`, { members }),
  removeMember: (groupId, memberId) =>
    api.put(`/api/groups/${groupId}/remove`, { memberId }),
}

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/api/messages'),
  getMessages: (userId, page = 1) =>
    api.get(`/api/messages/${userId}?page=${page}`),
  getGroupMessages: (groupId, page = 1) =>
    api.get(`/api/messages/group/${groupId}?page=${page}`),
  sendMessage: (data) => api.post('/api/messages', data),
  markAsDelivered: (messageIds) =>
    api.put('/api/messages/deliver', { messageIds }),
}

// Upload API
export const uploadAPI = {
  uploadFile: (formData) =>
    api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api
