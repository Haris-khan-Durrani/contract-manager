import axios from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
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
