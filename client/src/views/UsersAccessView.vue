<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">Users & Access Control</h1>
        <p class="page-subtitle">
          Manage HighLevel team member permissions and role-based access for this location.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="fetchUsers" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Refresh
        </button>

        <button class="btn btn-primary" @click="openGrantModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Grant User Access
        </button>
      </div>
    </div>

    <!-- Page Body -->
    <div class="page-body animate-fade-in">
      <!-- Role Matrix Helper Card -->
      <div class="glass-card role-matrix-card">
        <div class="matrix-col">
          <span class="badge badge-primary">SUPER_ADMIN</span>
          <p class="matrix-desc">Full system ownership, user permissions management, global configuration.</p>
        </div>
        <div class="matrix-col">
          <span class="badge badge-info">ADMIN</span>
          <p class="matrix-desc">Create/edit templates, design forms, configure GHL mapping and automation rules.</p>
        </div>
        <div class="matrix-col">
          <span class="badge badge-neutral">SALES</span>
          <p class="matrix-desc">Create contracts from templates, fill intake forms, dispatch to clients, track own pipeline.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="glass-card" style="padding: var(--space-12); text-align: center;">
        <div class="spinner"></div>
        <p class="text-muted" style="margin-top: var(--space-4);">Loading user permissions…</p>
      </div>

      <!-- Users Table -->
      <div v-else class="glass-card table-card">
        <div class="table-responsive">
          <table class="users-table">
            <thead>
              <tr>
                <th>HighLevel User ID</th>
                <th>Team Member Name</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Access Granted</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>
                  <code>{{ u.ghl_user_id }}</code>
                </td>
                <td>
                  <strong>{{ getUserName(u.ghl_user_id) }}</strong>
                  <div class="text-muted small-text">{{ getUserEmail(u.ghl_user_id) }}</div>
                </td>
                <td>
                  <select
                    v-model="u.app_role"
                    class="role-select"
                    @change="updateUserRole(u)"
                  >
                    <option value="SALES">SALES</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </td>
                <td>
                  <span v-if="u.enabled" class="badge badge-success">Active</span>
                  <span v-else class="badge badge-danger">Disabled</span>
                </td>
                <td>
                  {{ formatDate(u.created_at) }}
                </td>
                <td style="text-align: right;">
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    style="margin-right: var(--space-2);"
                    @click="toggleUserStatus(u)"
                  >
                    {{ u.enabled ? 'Disable' : 'Enable' }}
                  </button>
                  <button
                    type="button"
                    class="btn-icon-delete"
                    title="Revoke access"
                    @click="revokeAccess(u)"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Grant Access Modal -->
    <div v-if="showGrantModal" class="modal-overlay" @click.self="showGrantModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Grant User Access</h3>
          <button class="btn-close" @click="showGrantModal = false">✕</button>
        </div>

        <form @submit.prevent="submitGrantAccess" class="modal-form">
          <div class="form-group">
            <label class="form-label">Select HighLevel Team Member <span class="req">*</span></label>
            <select v-model="selectedGhlUserId" class="form-control" required>
              <option value="">-- Choose team member --</option>
              <option v-for="gu in ghlTeamMembers" :key="gu.id" :value="gu.id">
                {{ gu.name || `${gu.firstName || ''} ${gu.lastName || ''}`.trim() || gu.email }} ({{ gu.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Assign Role</label>
            <select v-model="selectedRole" class="form-control">
              <option value="SALES">SALES — Manual contract creation & form completion</option>
              <option value="ADMIN">ADMIN — Template & Form builder + full contracts access</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN — Full location ownership & user management</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showGrantModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="granting || !selectedGhlUserId">
              {{ granting ? 'Granting Access…' : 'Grant Access' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const loading = ref(true)
const users   = ref([])
const ghlTeamMembers = ref([])

const showGrantModal = ref(false)
const granting = ref(false)
const selectedGhlUserId = ref('')
const selectedRole = ref('SALES')

const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) ? '/api' : 'http://localhost:3001/api')

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

async function fetchUsers() {
  loading.value = true
  try {
    const [uRes, ghlRes] = await Promise.all([
      axios.get(`${apiBase}/auth/users`, { headers: getHeaders() }),
      axios.get(`${apiBase}/ghl/users`, { headers: getHeaders() }).catch(() => ({ data: { users: [] } })),
    ])

    users.value = uRes.data.users || []
    ghlTeamMembers.value = ghlRes.data.users || []
  } catch (err) {
    console.error('Fetch users error:', err)
  } finally {
    loading.value = false
  }
}

function getUserName(ghlUserId) {
  const match = ghlTeamMembers.value.find(m => m.id === ghlUserId)
  if (!match) return 'HighLevel User'
  return match.name || `${match.firstName || ''} ${match.lastName || ''}`.trim() || match.email
}

function getUserEmail(ghlUserId) {
  const match = ghlTeamMembers.value.find(m => m.id === ghlUserId)
  return match?.email || ''
}

function openGrantModal() {
  selectedGhlUserId.value = ''
  selectedRole.value = 'SALES'
  showGrantModal.value = true
}

async function submitGrantAccess() {
  if (!selectedGhlUserId.value) return
  granting.value = true

  try {
    await axios.post(
      `${apiBase}/auth/users`,
      {
        ghlUserId: selectedGhlUserId.value,
        appRole: selectedRole.value,
        enabled: true,
      },
      { headers: getHeaders() }
    )

    showGrantModal.value = false
    fetchUsers()
  } catch (err) {
    console.error('Grant user error:', err)
    alert('Failed to grant user access.')
  } finally {
    granting.value = false
  }
}

async function updateUserRole(user) {
  try {
    await axios.put(
      `${apiBase}/auth/users/${user.id}`,
      { appRole: user.app_role },
      { headers: getHeaders() }
    )
  } catch (err) {
    console.error('Update role error:', err)
    alert('Failed to update role.')
  }
}

async function toggleUserStatus(user) {
  const newStatus = !user.enabled
  try {
    await axios.put(
      `${apiBase}/auth/users/${user.id}`,
      { enabled: newStatus },
      { headers: getHeaders() }
    )
    user.enabled = newStatus
  } catch (err) {
    console.error('Toggle status error:', err)
  }
}

async function revokeAccess(user) {
  if (!confirm(`Are you sure you want to revoke Contract App access for this user?`)) return
  try {
    await axios.delete(`${apiBase}/auth/users/${user.id}`, { headers: getHeaders() })
    fetchUsers()
  } catch (err) {
    console.error('Revoke access error:', err)
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.page-title {
  font-family: var(--font-heading);
  font-size: 1.85rem;
  font-weight: 700;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: var(--space-1);
}

.role-matrix-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.matrix-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.matrix-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.table-card {
  padding: var(--space-2);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.users-table th {
  color: var(--color-text-muted);
  font-weight: 600;
  background: var(--color-bg-base);
}

.role-select {
  padding: 4px 8px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-base);
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-icon-delete {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  padding: 4px 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
}

.req {
  color: var(--color-danger);
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-base);
  font-size: 0.9rem;
}
</style>
