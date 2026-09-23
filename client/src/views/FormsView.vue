<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-titles">
        <h1 class="page-title">Forms & Data Intake</h1>
        <p class="page-subtitle">
          Design client intake forms (Normal individual forms & Team multi-applicant forms with Repeaters) and inspect submitted responses.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="fetchForms" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Refresh
        </button>

        <button class="btn btn-primary" @click="openCreateModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Intake Form
        </button>
      </div>
    </div>

    <!-- Page Body -->
    <div class="page-body animate-fade-in">
      <!-- Loading State -->
      <div v-if="loading" class="glass-card" style="padding: var(--space-12); text-align: center;">
        <div class="spinner"></div>
        <p class="text-muted" style="margin-top: var(--space-4);">Loading forms…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!forms.length" class="glass-card empty-card">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="11" y2="17"/>
          </svg>
        </div>
        <h2 style="margin: var(--space-4) 0 var(--space-2);">No Intake Forms Created</h2>
        <p class="text-muted" style="max-width: 440px; margin: 0 auto var(--space-6);">
          Create independent Normal or Team forms to collect client applicant data, validate fields, and save submissions.
        </p>
        <button class="btn btn-primary" @click="openCreateModal">
          Create Your First Form
        </button>
      </div>

      <!-- Forms Grid -->
      <div v-else class="forms-grid">
        <div
          v-for="form in forms"
          :key="form.id"
          class="glass-card form-card"
          @click="openBuilder(form.id)"
        >
          <div class="card-top">
            <div class="form-icon" :class="form.form_type === 'TEAM' ? 'team-icon' : ''">
              <span v-if="form.form_type === 'TEAM'">👥</span>
              <span v-else>👤</span>
            </div>
            <div class="card-top-badges">
              <span class="badge" :class="form.form_type === 'TEAM' ? 'badge-primary' : 'badge-neutral'">
                {{ form.form_type === 'TEAM' ? 'TEAM FORM' : 'NORMAL FORM' }}
              </span>
              <span class="badge badge-neutral">ID #{{ form.id }}</span>
            </div>
          </div>

          <h3 class="form-title">{{ form.name }}</h3>
          <p class="form-desc text-muted">
            {{ form.description || 'No description provided.' }}
          </p>

          <div class="form-stats">
            <div class="stat-pill">
              <span>📋 {{ form.field_count || 0 }} fields</span>
            </div>

            <div class="stat-pill">
              <span>📥 {{ form.submissions_count || 0 }} response{{ form.submissions_count === 1 ? '' : 's' }}</span>
            </div>

            <div class="stat-pill" v-if="form.template_usage_count">
              <span>📑 {{ form.template_usage_count }} contract{{ form.template_usage_count > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="card-date text-muted">Updated {{ formatDate(form.updated_at) }}</span>
            <div class="footer-actions">
              <button
                type="button"
                class="btn-delete-mini"
                @click.stop="deleteForm(form)"
                title="Delete Form"
              >
                🗑️
              </button>
              <span class="edit-link">Open Builder →</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-card animate-fade-in">
        <div class="modal-header">
          <h3>Create New Intake Form</h3>
          <button class="btn-close" @click="showCreateModal = false">✕</button>
        </div>

        <form @submit.prevent="createForm" class="modal-form">
          <div class="form-group">
            <label class="form-label">Form Name <span class="req">*</span></label>
            <input
              type="text"
              v-model="newForm.name"
              class="form-control"
              placeholder="e.g. Portugal D7 Client Information Form"
              required
              autofocus
            />
          </div>

          <!-- Form Type Radio Selection -->
          <div class="form-group">
            <label class="form-label">Form Type <span class="req">*</span></label>
            <div class="type-selector-grid">
              <label class="type-card" :class="{ selected: newForm.formType === 'NORMAL' }">
                <input type="radio" value="NORMAL" v-model="newForm.formType" />
                <div class="type-icon">👤</div>
                <div class="type-info">
                  <strong>Normal Form</strong>
                  <span>Single individual / main applicant contract</span>
                </div>
              </label>

              <label class="type-card" :class="{ selected: newForm.formType === 'TEAM' }">
                <input type="radio" value="TEAM" v-model="newForm.formType" />
                <div class="type-icon">👥</div>
                <div class="type-info">
                  <strong>Team Form</strong>
                  <span>Main applicant + repeatable team members / dependents</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="newForm.description"
              class="form-control"
              rows="3"
              placeholder="Describe what data this form collects..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="creating || !newForm.name.trim()">
              {{ creating ? 'Creating…' : 'Create & Open Form Builder' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const loading = ref(true)
const forms   = ref([])
const showCreateModal = ref(false)
const creating = ref(false)

const newForm = ref({
  name: '',
  formType: 'NORMAL',
  description: '',
})

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function getHeaders() {
  return {
    Authorization: `Bearer ${auth.sessionToken}`,
    'X-GHL-Context': auth.userContextToken || '',
  }
}

async function fetchForms() {
  loading.value = true
  try {
    const res = await axios.get(`${apiBase}/forms`, { headers: getHeaders() })
    forms.value = res.data.forms || []
  } catch (err) {
    console.error('Failed to fetch forms:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  newForm.value = { name: '', formType: 'NORMAL', description: '' }
  showCreateModal.value = true
}

async function createForm() {
  if (!newForm.value.name.trim()) return
  creating.value = true

  try {
    const isTeam = newForm.value.formType === 'TEAM'
    
    // Build initial template sections for the chosen type
    const initialSections = [
      {
        id: 'sec_personal_info',
        title: 'Personal Information',
        description: 'Main applicant identification details',
        fields: [
          {
            id: 'f_full_name',
            key: 'applicant.full_name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter client full name',
            width: 'half',
          },
          {
            id: 'f_passport',
            key: 'applicant.passport_number',
            label: 'Passport / EID',
            type: 'text',
            required: true,
            placeholder: 'e.g. P12345678',
            width: 'half',
          },
          {
            id: 'f_nationality',
            key: 'applicant.nationality',
            label: 'Nationality',
            type: 'text',
            required: true,
            placeholder: 'e.g. British / Emirati',
            width: 'half',
          },
          {
            id: 'f_dob',
            key: 'applicant.date_of_birth',
            label: 'Date of Birth',
            type: 'date',
            required: true,
            width: 'half',
          },
        ],
      },
      {
        id: 'sec_contact_info',
        title: 'Contact Information',
        fields: [
          {
            id: 'f_mobile',
            key: 'applicant.mobile',
            label: 'Mobile Phone',
            type: 'phone',
            required: true,
            placeholder: '+971 50 123 4567',
            width: 'half',
          },
          {
            id: 'f_email',
            key: 'applicant.email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'client@example.com',
            width: 'half',
          },
          {
            id: 'f_address',
            key: 'applicant.address',
            label: 'Physical Address',
            type: 'text',
            required: false,
            placeholder: 'Street, City, Country',
            width: 'full',
          },
        ],
      },
    ]

    // If Team form, add Team Members Repeater Section
    if (isTeam) {
      initialSections.push({
        id: 'sec_team_members',
        title: 'Team Members / Dependents',
        description: 'Additional members and applicants included in this filing',
        isRepeater: true,
        repeaterKey: 'team_members',
        repeaterLabel: 'Team Member',
        minRepeat: 0,
        maxRepeat: null,
        addButtonText: '+ Add Another Person',
        fields: [
          {
            id: 'f_tm_name',
            key: 'full_name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Member full name',
            width: 'half',
          },
          {
            id: 'f_tm_passport',
            key: 'passport_number',
            label: 'Passport Number',
            type: 'text',
            required: true,
            placeholder: 'Passport / ID',
            width: 'half',
          },
          {
            id: 'f_tm_nationality',
            key: 'nationality',
            label: 'Nationality',
            type: 'text',
            required: true,
            placeholder: 'Nationality',
            width: 'half',
          },
          {
            id: 'f_tm_relationship',
            key: 'relationship',
            label: 'Relationship / Role',
            type: 'dropdown',
            required: true,
            width: 'half',
            options: ['Spouse', 'Child', 'Partner', 'Associate / Employee'],
          },
          {
            id: 'f_tm_dob',
            key: 'date_of_birth',
            label: 'Date of Birth',
            type: 'date',
            required: false,
            width: 'half',
          },
        ],
      })
    }

    const res = await axios.post(
      `${apiBase}/forms`,
      {
        name: newForm.value.name.trim(),
        description: newForm.value.description.trim(),
        formType: newForm.value.formType,
        schema: {
          formType: newForm.value.formType,
          sections: initialSections,
        },
      },
      { headers: getHeaders() }
    )

    showCreateModal.value = false
    const formId = res.data.formId
    router.push(`/forms/${formId}/builder`)
  } catch (err) {
    console.error('Failed to create form:', err)
    alert('Failed to create form.')
  } finally {
    creating.value = false
  }
}

async function deleteForm(form) {
  if (!confirm(`Are you sure you want to delete form "${form.name}"?`)) return
  try {
    await axios.delete(`${apiBase}/forms/${form.id}`, { headers: getHeaders() })
    fetchForms()
  } catch (err) {
    console.error('Delete form error:', err)
    alert('Failed to delete form.')
  }
}

function openBuilder(id) {
  router.push(`/forms/${id}/builder`)
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
  fetchForms()
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

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.form-card {
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.form-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.card-top-badges {
  display: flex;
  gap: 6px;
}

.form-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.team-icon {
  background: rgba(16, 185, 129, 0.12);
}

.form-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.form-desc {
  font-size: 0.85rem;
  line-height: 1.5;
  flex: 1;
  margin-bottom: var(--space-4);
}

.form-stats {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
  font-size: 0.8rem;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-delete-mini {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.btn-delete-mini:hover {
  opacity: 1;
}

.edit-link {
  color: var(--color-primary-light);
  font-weight: 600;
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
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
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
  margin-top: var(--space-2);
}

.type-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.type-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--color-bg-base);
  transition: all var(--transition-fast);
}

.type-card input {
  display: none;
}

.type-card:hover {
  border-color: var(--color-primary-light);
}

.type-card.selected {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
}

.type-icon {
  font-size: 1.5rem;
}

.type-info strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text-base);
}

.type-info span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
