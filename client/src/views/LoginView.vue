<template>
  <div class="login-page">
    <div class="login-card-container">
      <!-- App Header / Brand -->
      <div class="login-header">
        <div class="login-badge">
          <span class="dot-green"></span>
          <span>GoHighLevel Direct Connect</span>
        </div>
        <div class="login-logo-row">
          <div class="login-logo-icon">⚡</div>
          <h1 class="login-title">ContractOS</h1>
        </div>
        <p class="login-subtitle">
          Connect with your GoHighLevel User ID, Location ID & Private Integration Token.
        </p>
      </div>

      <!-- Login Card -->
      <div class="card login-card">
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Location ID -->
          <div class="form-group">
            <label class="form-label" for="locationId">
              Location ID (Sub-Account) <span class="text-danger">*</span>
            </label>
            <div class="input-icon-wrapper">
              <span class="input-icon">📍</span>
              <input
                id="locationId"
                v-model="form.locationId"
                type="text"
                class="form-control with-icon"
                placeholder="e.g. loc_default_001 or GHL Location ID"
                required
                autocomplete="off"
              />
            </div>
          </div>

          <!-- User ID -->
          <div class="form-group">
            <label class="form-label" for="userId">
              User ID <span class="text-danger">*</span>
            </label>
            <div class="input-icon-wrapper">
              <span class="input-icon">👤</span>
              <input
                id="userId"
                v-model="form.userId"
                type="text"
                class="form-control with-icon"
                placeholder="e.g. user_admin_001 or GHL User ID"
                required
                autocomplete="off"
              />
            </div>
          </div>

          <!-- Private Integration Token -->
          <div class="form-group">
            <label class="form-label" for="privateToken">
              Private Integration Token <span class="text-danger">*</span>
            </label>
            <div class="input-icon-wrapper">
              <span class="input-icon">🔑</span>
              <input
                id="privateToken"
                v-model="form.privateToken"
                :type="showToken ? 'text' : 'password'"
                class="form-control with-icon"
                placeholder="pit_..."
                required
                autocomplete="off"
              />
              <button
                type="button"
                class="token-toggle-btn"
                @click="showToken = !showToken"
                tabindex="-1"
              >
                {{ showToken ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="login-error-alert">
            <span style="font-size: 1.1rem;">⚠️</span>
            <div style="flex: 1;">{{ errorMessage }}</div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-block btn-lg"
            :disabled="auth.loading || !isFormValid"
            style="margin-top: 10px; width: 100%; justify-content: center; height: 44px; font-weight: 600;"
          >
            <span v-if="auth.loading" class="spinner-inline"></span>
            <span v-else>🚀 Connect & Launch App</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="login-divider">
          <span>or Quick Dev Test</span>
        </div>

        <!-- Dev Quick Buttons -->
        <div class="dev-quick-actions">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="fillDemo('ADMIN')"
            :disabled="auth.loading"
          >
            Fill Admin Demo
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="fillDemo('SALES')"
            :disabled="auth.loading"
          >
            Fill Sales Demo
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="login-footer">
        <div class="login-footer-item">
          <span>🔒 Authenticated directly via GoHighLevel REST API</span>
        </div>
        <div class="login-footer-item" style="color: var(--color-text-muted); font-size: 0.75rem;">
          Permissions and role (Admin / Sales) are resolved automatically from HighLevel CRM.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const showToken = ref(false)
const errorMessage = ref('')

const form = ref({
  locationId:   localStorage.getItem('last_location_id') || 'loc_default_001',
  userId:       localStorage.getItem('last_user_id')     || 'user_admin_001',
  privateToken: 'pit_dev_token_sample',
})

const isFormValid = computed(() => {
  return form.value.locationId.trim() && form.value.userId.trim() && form.value.privateToken.trim()
})

onMounted(async () => {
  // If user already authenticated, redirect to dashboard or redirect query
  if (auth.isAuthenticated) {
    const redirect = route.query.redirect || '/dashboard'
    router.replace(redirect)
  }
})

async function handleLogin() {
  errorMessage.value = ''
  try {
    await auth.login({
      locationId:   form.value.locationId.trim(),
      userId:       form.value.userId.trim(),
      privateToken: form.value.privateToken.trim(),
    })

    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    errorMessage.value = err.message || 'Login failed. Please verify your GoHighLevel credentials.'
  }
}

function fillDemo(role) {
  if (role === 'ADMIN') {
    form.value.locationId   = 'loc_default_001'
    form.value.userId       = 'user_superadmin_001'
    form.value.privateToken = 'pit_dev_token_sample'
  } else {
    form.value.locationId   = 'loc_default_001'
    form.value.userId       = 'user_sales_001'
    form.value.privateToken = 'pit_dev_token_sample'
  }
  handleLogin()
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 24px;
}

.login-card-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.login-logo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.login-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  margin: 0;
}

.login-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
  max-width: 380px;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 1rem;
  pointer-events: none;
  opacity: 0.8;
}

.form-control.with-icon {
  padding-left: 38px;
  padding-right: 54px;
  height: 42px;
  font-size: 0.875rem;
}

.token-toggle-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.token-toggle-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.login-error-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.login-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0 14px;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.login-divider span {
  padding: 0 10px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dev-quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.login-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-footer-item {
  font-size: 0.8125rem;
  color: #cbd5e1;
}

.spinner-inline {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
