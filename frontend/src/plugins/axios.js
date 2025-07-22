// frontend/src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create axios instance with environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401 && authStore.token) {
      // Token expired, logout user
      await authStore.logout()
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api