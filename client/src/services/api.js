import axios from 'axios'

export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      return '/api'
    }
  }
  return 'http://localhost:3001/api'
}

export const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         20000,
  withCredentials: false,
})

// Response interceptor: surface error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message
      || error?.response?.data?.error
      || error?.message
      || 'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

export default api
