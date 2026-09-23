import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

/**
 * auth.js — GoHighLevel Direct Authentication Store
 *
 * Authenticates via:
 *   1. Direct login with (userId, locationId, privateToken)
 *   2. URL Query parameters (?userId=...&locationId=...&privateToken=...)
 *   3. Stored JWT session in localStorage
 */
export const useAuthStore = defineStore('auth', () => {
  const user       = ref(null)  // { userId, locationId, name, email }
  const role       = ref(null)  // 'SUPER_ADMIN' | 'ADMIN' | 'SALES'
  const token      = ref(localStorage.getItem('contract_auth_token') || null)
  const loading    = ref(false)
  const error      = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!role.value)
  const hasRole = (roles) => roles.includes(role.value)

  /**
   * Log in with GoHighLevel credentials.
   * @param {{ userId: string, locationId: string, privateToken: string }} credentials
   */
  async function login({ userId, locationId, privateToken }) {
    loading.value = true
    error.value   = null

    try {
      const { data } = await api.post('/auth/login', {
        userId,
        locationId,
        privateToken,
      })

      token.value = data.token
      user.value  = data.user
      role.value  = data.role

      // Save token and last used location/user to localStorage
      localStorage.setItem('contract_auth_token', data.token)
      localStorage.setItem('last_location_id', locationId)
      localStorage.setItem('last_user_id', userId)

      // Set global Axios Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return data
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Verify and restore an existing session from localStorage.
   */
  async function verifySession() {
    const storedToken = token.value || localStorage.getItem('contract_auth_token')
    if (!storedToken) return false

    loading.value = true
    error.value   = null

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      const { data } = await api.post('/auth/verify', {})

      token.value = storedToken
      user.value = {
        userId:     data.userId,
        locationId: data.locationId,
        name:       data.name,
        email:      data.email,
      }
      role.value = data.role
      return true
    } catch (err) {
      console.warn('[Auth] Session verification failed, clearing session:', err.message)
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check URL query parameters for userId, locationId, and privateToken.
   * Returns true if auto-login was successful.
   */
  async function checkUrlParams(queryParams = {}) {
    const uId = queryParams.userId || queryParams.userid || queryParams.user_id
    const lId = queryParams.locationId || queryParams.locationid || queryParams.location_id
    const pToken = queryParams.privateToken || queryParams.privatetoken || queryParams.token || queryParams.private_token

    if (uId && lId && pToken) {
      try {
        await login({
          userId:       uId.toString(),
          locationId:   lId.toString(),
          privateToken: pToken.toString(),
        })
        return true
      } catch (err) {
        console.error('[Auth] URL params auto-login failed:', err.message)
      }
    }
    return false
  }

  /**
   * Log in with a quick dev/test token for local testing.
   */
  async function devLogin(devRole = 'ADMIN') {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/auth/dev-token', { role: devRole })
      token.value = data.token
      user.value = {
        userId:     data.userId,
        locationId: data.locationId,
        name:       `Dev ${devRole} User`,
        email:      `${devRole.toLowerCase()}@localdev.com`,
      }
      role.value = data.role
      localStorage.setItem('contract_auth_token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const sessionToken = computed(() => token.value)
  const userContextToken = computed(() => token.value)

  function logout() {
    user.value  = null
    role.value  = null
    token.value = null
    localStorage.removeItem('contract_auth_token')
    delete api.defaults.headers.common['Authorization']
  }

  return {
    user,
    role,
    token,
    sessionToken,
    userContextToken,
    loading,
    error,
    isAuthenticated,
    hasRole,
    login,
    verifySession,
    checkUrlParams,
    devLogin,
    logout,
  }
})
