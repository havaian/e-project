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

/**
 * Decode HTML entities in text
 * @param {string} text - Text potentially containing HTML entities
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Use browser's built-in HTML decoding
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  return tempDiv.textContent || tempDiv.innerText || text;
}

/**
 * Check if a field should be cleaned of HTML entities
 * These are typically user-input fields or predefined values that shouldn't be encoded
 * @param {string} fieldName - Name of the field
 * @returns {boolean} Whether field should be cleaned
 */
function shouldCleanField(fieldName) {
  const fieldsToClean = [
    // Language and location fields
    'languages', 'language', 'country', 'city', 'state', 'region',
    
    // Name and contact fields
    'firstName', 'lastName', 'name', 'displayName', 'username',
    'phone', 'email', 'website',
    
    // Professional fields
    'specializations', 'specialization', 'skills', 'certifications',
    'education', 'degree', 'institution', 'jobTitle', 'company',
    
    // Profile fields (but be careful with bio/description - those might need encoding)
    'title', 'subtitle', 'profession', 'category', 'type',
    
    // Nested object field names
    'relationship', // for emergencyContact.relationship
  ];
  
  return fieldsToClean.includes(fieldName);
}

/**
 * Check if a field contains user-generated content that should remain encoded
 * @param {string} fieldName - Name of the field
 * @returns {boolean} Whether field should keep HTML encoding for security
 */
function shouldKeepEncoded(fieldName) {
  const encodedFields = [
    'bio', 'description', 'shortDescription', 'longDescription',
    'notes', 'comments', 'message', 'content', 'text',
    'sessionSummary', 'feedback', 'review', 'testimonial'
  ];
  
  return encodedFields.includes(fieldName);
}

/**
 * Recursively process object to decode HTML entities in appropriate fields
 * @param {any} obj - Object to process
 * @param {string} parentKey - Parent key for context
 * @returns {any} Processed object
 */
function processDataForSubmission(obj, parentKey = '') {
  if (!obj) return obj;

  // Handle strings
  if (typeof obj === 'string') {
    // Don't decode if parent key suggests this should stay encoded
    if (shouldKeepEncoded(parentKey)) {
      return obj;
    }
    
    // Always decode if it's a field we should clean, or if it contains HTML entities
    if (shouldCleanField(parentKey) || obj.includes('&')) {
      return decodeHtmlEntities(obj);
    }
    
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => processDataForSubmission(item, parentKey));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result = {};
    
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        result[key] = processDataForSubmission(obj[key], key);
      }
    }
    
    return result;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Recursively process response data to decode HTML entities
 * @param {any} obj - Response object to process
 * @returns {any} Processed object
 */
function processResponseData(obj) {
  if (!obj) return obj;

  // Handle strings - decode any HTML entities in responses
  if (typeof obj === 'string') {
    // Decode if it contains HTML entities
    if (obj.includes('&')) {
      return decodeHtmlEntities(obj);
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => processResponseData(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result = {};
    
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        result[key] = processResponseData(obj[key]);
      }
    }
    
    return result;
  }

  // Return primitives as-is
  return obj;
}

// Request interceptor - clean data being sent
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // Process request data for POST, PUT, PATCH requests
    if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      config.data = processDataForSubmission(config.data);
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - clean data being received
api.interceptors.response.use(
  (response) => {
    // Process response data to decode HTML entities selectively
    if (response.data) {
      response.data = processResponseData(response.data);
    }

    return response
  },
  (error) => {
    console.error('API Error:', error)

    // Handle specific error cases
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Process error response data as well
    if (error.response?.data) {
      error.response.data = processResponseData(error.response.data);
    }

    return Promise.reject(error)
  }
)

export default api