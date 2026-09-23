<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg-base); padding: var(--space-6);">
    <div class="glass-card" style="padding: var(--space-10); text-align: center; max-width: 520px; width: 100%;">
      <div style="font-size: 3rem; margin-bottom: var(--space-3);">🔒</div>
      <h2 style="margin: 0 0 var(--space-2) 0; font-family: var(--font-heading); color: var(--color-text-primary);">
        Access Denied
      </h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6); font-size: var(--text-sm); line-height: 1.5;">
        You don't have an active GoHighLevel session or authorized access to this contract application.
      </p>

      <!-- Local Development Bypass (Active when opened directly outside GHL iframe) -->
      <div v-if="isStandalone" style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-lg); padding: var(--space-5); text-align: left;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="badge badge-sent" style="font-size: 11px;">Local Dev Mode</span>
          <span style="font-size: var(--text-xs); color: var(--color-text-muted);">Quick-start simulation</span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
          Running locally without an embedded GoHighLevel iframe? Select a simulated role to generate a local session token:
        </p>

        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          <button 
            class="btn btn-primary" 
            :disabled="loading"
            @click="loginWithRole('SUPER_ADMIN')"
            style="justify-content: center;"
          >
            {{ loading && selectedRole === 'SUPER_ADMIN' ? 'Signing in…' : '⚡ Login as Super Admin' }}
          </button>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);">
            <button 
              class="btn btn-secondary" 
              :disabled="loading"
              @click="loginWithRole('ADMIN')"
              style="justify-content: center; font-size: var(--text-xs);"
            >
              Login as Admin
            </button>
            <button 
              class="btn btn-secondary" 
              :disabled="loading"
              @click="loginWithRole('SALES')"
              style="justify-content: center; font-size: var(--text-xs);"
            >
              Login as Sales
            </button>
          </div>
        </div>

        <div v-if="devError" style="margin-top: var(--space-3); color: var(--color-danger); font-size: var(--text-xs);">
          {{ devError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const isStandalone = ref(window.parent === window)
const loading = ref(false)
const selectedRole = ref(null)
const devError = ref('')

async function loginWithRole(role) {
  loading.value = true
  selectedRole.value = role
  devError.value = ''
  try {
    const res = await api.post('/auth/dev-token', { role })
    if (res.data?.token) {
      localStorage.setItem('dev_ghl_token', res.data.token)
      window.location.href = '/dashboard'
    } else {
      devError.value = 'Failed to retrieve dev token.'
    }
  } catch (err) {
    devError.value = err.message || 'Make sure backend is running on port 3001.'
  } finally {
    loading.value = false
  }
}
</script>
