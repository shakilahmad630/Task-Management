import axios from 'axios'

// In production (Vercel), requests go to /api/* which Next.js proxies to Render backend.
// This eliminates CORS — browser only talks to same origin (Vercel).
// In local dev, call the backend directly.
const API_URL = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081')

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})


// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Some APIs return 200 OK but with an error wrapped in the data
    const data = response.data || {}
    if (data.status === 'FAIL' || data.status === 'ERROR') {
      return Promise.reject({ message: data.message || 'An error occurred' })
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Remove cookie too
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/signup', data),
}

// ── Tasks ─────────────────────────────────────────
export const tasksApi = {
  /**
   * Get paginated task list
   * @param {Object} params - { page, size, status, search, sortBy, sortOrder }
   */
  getAll: (params = {}) => api.get('/tasks/getAll', { params }),

  getById: (id) => api.get(`/tasks/get/${id}`),

  create: (data) => api.post('/tasks/create', data),

  update: (id, data) => api.patch(`/tasks/update/${id}`, data),

  delete: (id) => api.delete(`/tasks/delete/${id}`),

  uploadAttachment: (id, formData) => api.post(`/tasks/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  getActivities: (id) => api.get(`/tasks/${id}/activities`),
}

// ── Users ─────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// ── Activities ────────────────────────────────────
export const activitiesApi = {
  log: (data) => api.post('/activities/log', data),
  getForTask: (taskId) => api.get(`/activities/task/${taskId}`),
  getAll: () => api.get('/activities/all'),
  clearAll: () => api.delete('/activities/clear'),
}

export default api
