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
        <button class="btn btn-secondary" @click="fetchUsers" :disabled="loading || syncing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Refresh
        </button>

        <button class="btn btn-secondary" @click="syncGhlUsers" :disabled="syncing || loading" title="Fetch all team members directly from GoHighLevel CRM">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {{ syncing ? 'Syncing Team…' : '🔄 Sync HighLevel Team' }}
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

      <!-- Users Table & Filter -->
      <div v-else>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; max-width: 360px;">
            <input
              type="text"
              v-model="userSearchQuery"
              placeholder="Search team member by name or email…"
              class="form-control"
              style="font-size: 0.825rem; padding-left: 32px;"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8;">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div style="font-size: 0.8rem; color: #64748b;">
            Showing <strong>{{ filteredUsers.length }}</strong> of {{ users.length }} team members
          </div>
        </div>

        <div class="glass-card table-card">
          <div class="table-responsive">
            <table class="users-table">
              <thead>
                <tr>
                  <th>HighLevel User ID</th>
                  <th>Team Member Name</th>
                  <th>Assigned Role</th>
                  <th>Official Signature</th>
                  <th>Client Summary</th>
                  <th>Status</th>
                  <th>Access Granted</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!filteredUsers.length">
                  <td colspan="8" style="text-align: center; padding: 32px; color: #94a3b8;">
                    No team members found matching "{{ userSearchQuery }}".
                  </td>
                </tr>
                <tr v-for="u in filteredUsers" :key="u.id">
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
                  <div v-if="u.signature_png_url" style="display: flex; align-items: center; gap: 6px;">
                    <div style="background: #fff; border: 1px solid var(--color-border); border-radius: 4px; padding: 2px 6px; display: inline-flex; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                      <img :src="u.signature_png_url" alt="Signature" style="max-height: 22px; max-width: 65px; object-fit: contain;" />
                    </div>
                    <button type="button" class="btn btn-secondary" style="padding: 2px 6px; font-size: 11px;" @click="openSigModal(u)">
                      Edit
                    </button>
                  </div>
                  <div v-else>
                    <button type="button" class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" @click="openSigModal(u)">
                      ✍️ Upload PNG
                    </button>
                  </div>
                </td>
                <td>
                  <div v-if="['ADMIN', 'SUPER_ADMIN'].includes(u.app_role)">
                    <span class="badge badge-success" style="font-size: 11px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-weight: 600;">
                      ✓ Full Access (Admin)
                    </span>
                  </div>
                  <div v-else>
                    <button
                      type="button"
                      class="btn-toggle-summary"
                      :class="u.can_fill_client_summary ? 'active' : 'inactive'"
                      :title="u.can_fill_client_summary ? 'Click to restrict Client Summary access' : 'Click to enable Client Summary access'"
                      @click="toggleClientSummaryAccess(u)"
                    >
                      <span class="toggle-dot"></span>
                      <span class="toggle-text">{{ u.can_fill_client_summary ? 'Enabled' : 'Restricted' }}</span>
                    </button>
                  </div>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <label class="form-label" style="margin: 0;">HighLevel Team Member <span class="req">*</span></label>
              <button
                type="button"
                style="background: none; border: none; font-size: 11px; color: var(--color-primary); cursor: pointer; text-decoration: underline;"
                @click="manualUserIdMode = !manualUserIdMode"
              >
                {{ manualUserIdMode ? '‹ Pick from Dropdown' : 'Or type User ID manually ›' }}
              </button>
            </div>

            <input
              v-if="manualUserIdMode"
              type="text"
              v-model="selectedGhlUserId"
              class="form-control"
              placeholder="e.g. bpk7VJffUlCMBDWWdZSf or user email"
              required
            />
            <select v-else v-model="selectedGhlUserId" class="form-control" required>
              <option value="">-- Choose team member ({{ ghlTeamMembers.length }} available) --</option>
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

    <!-- Official Signature Upload Modal -->
    <div v-if="showSigModal" class="modal-overlay" @click.self="showSigModal = false">
      <div class="modal-card animate-fade-in" style="max-width: 480px;">
        <div class="modal-header">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem;">Official Signature PNG</h3>
            <p style="font-size: 12px; color: var(--color-text-muted); margin: 3px 0 0;">
              {{ getUserName(activeUser?.ghl_user_id) }} ({{ getUserEmail(activeUser?.ghl_user_id) }})
            </p>
          </div>
          <button class="btn-close" @click="showSigModal = false">✕</button>
        </div>

        <div style="padding: 16px 0;">
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 14px;">
            Upload an official signature with a transparent background. When agreements assigned to this team member are sealed, this signature and the company stamp will automatically be embedded.
          </p>

          <!-- Signature Preview Box -->
          <div style="border: 1px dashed var(--color-border); border-radius: 8px; padding: 20px; background: #fff; text-align: center; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
            <div v-if="activeSigData" style="position: relative; width: 100%;">
              <img :src="activeSigData" alt="Signature Preview" style="max-height: 60px; max-width: 80%; object-fit: contain;" />
              <div style="border-top: 1px solid #cbd5e1; width: 75%; margin: 8px auto 0;"></div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Authorized Company Signature</div>
              <div style="margin-top: 6px;">
                <span v-if="uploadingMedia" class="badge badge-warning" style="font-size: 10px; padding: 2px 8px;">
                  ⏳ Uploading to HighLevel Media…
                </span>
                <span v-else-if="activeSigData && (activeSigData.includes('filesafe.space') || activeSigData.startsWith('http'))" class="badge badge-success" style="font-size: 10px; padding: 2px 8px;">
                  ☁️ Hosted on HighLevel Media
                </span>
              </div>
            </div>
            <div v-else style="color: #94a3b8; font-size: 12px;">
              <span>No signature uploaded for this user yet</span>
            </div>
          </div>

          <!-- File Upload Controls -->
          <div style="margin-top: 14px; display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn btn-secondary" style="flex: 1;" @click="triggerUserSigUpload">
              📁 Choose PNG File
            </button>
            <input 
              ref="userSigFileInput" 
              type="file" 
              accept="image/png,image/jpeg,image/webp" 
              style="display: none;" 
              @change="onUserSigFileSelected" 
            />
            <button 
              v-if="activeSigData" 
              type="button" 
              class="btn btn-danger" 
              @click="activeSigData = ''"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 8px;">
          <button type="button" class="btn btn-secondary" @click="showSigModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="savingSig" @click="saveUserSignature">
            {{ savingSig ? 'Saving…' : 'Save Signature' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const loading = ref(true)
const syncing = ref(false)
const users   = ref([])
const ghlTeamMembers = ref([])
const userSearchQuery = ref('')

const showGrantModal = ref(false)
const granting = ref(false)
const selectedGhlUserId = ref('')
const selectedRole = ref('SALES')
const manualUserIdMode = ref(false)

const showSigModal = ref(false)
const activeUser = ref(null)
const activeSigData = ref('')
const savingSig = ref(false)
const uploadingMedia = ref(false)
const userSigFileInput = ref(null)

const filteredUsers = computed(() => {
  if (!userSearchQuery.value.trim()) return users.value
  const q = userSearchQuery.value.toLowerCase().trim()
  return users.value.filter(u => {
    const name = getUserName(u.ghl_user_id).toLowerCase()
    const email = getUserEmail(u.ghl_user_id).toLowerCase()
    const id = (u.ghl_user_id || '').toLowerCase()
    return name.includes(q) || email.includes(q) || id.includes(q)
  })
})

function openSigModal(u) {
  activeUser.value = u
  activeSigData.value = u.signature_png_url || ''
  showSigModal.value = true
}

function triggerUserSigUpload() {
  userSigFileInput.value?.click()
}

function onUserSigFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.')
    return
  }
  const reader = new FileReader()
  reader.onload = async (event) => {
    const dataBase64 = event.target.result
    activeSigData.value = dataBase64
    uploadingMedia.value = true
    try {
      const res = await axios.post(
        `${apiBase}/ghl/media/upload`,
        {
          dataBase64,
          filename: `sig_${activeUser.value?.ghl_user_id || 'user'}_${Date.now()}.png`,
          mimeType: file.type || 'image/png',
        },
        { headers: getHeaders() }
      )
      if (res.data?.url) {
        activeSigData.value = res.data.url
      }
    } catch (err) {
      console.warn('GHL direct media upload notice (will sync on save):', err)
    } finally {
      uploadingMedia.value = false
    }
  }
  reader.readAsDataURL(file)
}

async function saveUserSignature() {
  if (!activeUser.value) return
  savingSig.value = true
  try {
    await axios.post(
      `${apiBase}/auth/users/${activeUser.value.id}/signature`,
      { signaturePng: activeSigData.value || null },
      { headers: getHeaders() }
    )
    activeUser.value.signature_png_url = activeSigData.value || null
    showSigModal.value = false
  } catch (err) {
    console.error('Save signature error:', err)
    alert(err.response?.data?.error || 'Failed to save signature.')
  } finally {
    savingSig.value = false
  }
}

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

async function syncGhlUsers() {
  syncing.value = true
  try {
    const res = await axios.post(`${apiBase}/auth/users/sync`, {}, { headers: getHeaders() })
    await fetchUsers()
    alert(`✓ Successfully synced HighLevel team! Total active members: ${res.data?.count || users.value.length}`)
  } catch (err) {
    console.error('Sync error:', err)
    alert('Failed to sync users with GoHighLevel CRM.')
  } finally {
    syncing.value = false
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

async function toggleClientSummaryAccess(user) {
  const newStatus = !user.can_fill_client_summary
  try {
    await axios.put(
      `${apiBase}/auth/users/${user.id}`,
      { can_fill_client_summary: newStatus ? 1 : 0 },
      { headers: getHeaders() }
    )
    user.can_fill_client_summary = newStatus ? 1 : 0
  } catch (err) {
    console.error('Toggle client summary error:', err)
    alert('Failed to update Client Summary permission.')
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

.btn-toggle-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-toggle-summary.active {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.btn-toggle-summary.active .toggle-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.btn-toggle-summary.inactive {
  background: #f1f5f9;
  color: #64748b;
  border-color: #cbd5e1;
}

.btn-toggle-summary.inactive .toggle-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.btn-toggle-summary:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}
</style>
