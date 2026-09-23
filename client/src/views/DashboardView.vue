<template>
  <div class="animate-fade-in">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6);">
      <div>
        <h1 style="font-size: 1.75rem; margin-bottom: 4px;">Contracts Dashboard</h1>
        <p style="color: var(--color-text-secondary); font-size: var(--text-sm);">
          Real-time contract pipeline, awaiting forms, and active signoffs.
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <router-link to="/contracts" class="btn btn-secondary btn-sm">
          View All Contracts
        </router-link>
        <router-link to="/contracts/new" class="btn btn-primary btn-sm">
          + Create Contract
        </router-link>
      </div>
    </div>

    <!-- KPI Metric Tiles (Ref: Image KPI style) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
      <div v-for="m in metrics" :key="m.label" class="saas-card" style="padding: 18px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">
            {{ m.label }}
          </span>
          <span class="badge" :class="m.badgeClass" style="font-size: 11px; padding: 2px 8px;">
            {{ m.trend }}
          </span>
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--color-text-primary);">
            {{ loading ? '—' : m.value }}
          </div>
        </div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">
          {{ m.subtext }}
        </div>
      </div>
    </div>

    <!-- Action Required: Awaiting Form Completion -->
    <div class="saas-card" style="margin-bottom: var(--space-6);">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 28px; height: 28px; border-radius: 6px; background: #fffbeb; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 14px;">
            ⚠️
          </div>
          <div>
            <h3 style="font-size: 1.05rem; margin: 0;">Action Required: Intake Forms</h3>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Contracts triggered by GHL or draft mode requiring sales responses</span>
          </div>
        </div>
        <span class="badge badge-expired" style="font-size: 11px;">{{ awaitingForm.length }} Pending</span>
      </div>

      <div v-if="awaitingForm.length === 0" style="padding: 36px 20px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem;">
        ✅ All contracts are up-to-date. None awaiting form intake.
      </div>
      <div v-else class="data-table-wrapper" style="border: none; border-radius: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Template</th>
              <th>Created</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in awaitingForm" :key="c.id">
              <td>
                <div style="font-weight: 600;">{{ c.recipient_name || c.ghl_contact_id }}</div>
                <div v-if="c.recipient_email" style="font-size:0.75rem;color:var(--color-text-muted);">{{ c.recipient_email }}</div>
              </td>
              <td>{{ c.template_name || 'Standard Agreement' }}</td>
              <td style="color: var(--color-text-muted); font-size: 0.8125rem;">{{ formatDate(c.created_at) }}</td>
              <td style="text-align: right;">
                <router-link :to="`/contracts/${c.id}`" class="btn btn-primary btn-sm" style="font-size: 0.8rem;">
                  Complete Form &amp; Send →
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Contracts Pipeline Table -->
    <div class="saas-card">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 28px; height: 28px; border-radius: 6px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 14px;">
            📄
          </div>
          <div>
            <h3 style="font-size: 1.05rem; margin: 0;">Recent Contract Activity</h3>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Latest contract lifecycle events synced with GoHighLevel</span>
          </div>
        </div>
        <router-link to="/contracts" class="btn btn-ghost btn-sm" style="font-size: 0.8rem;">
          View All →
        </router-link>
      </div>

      <div v-if="recentContracts.length === 0" style="padding: 36px 20px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem;">
        No contract activity yet. Click "+ Create Contract" to start.
      </div>
      <div v-else class="data-table-wrapper" style="border: none; border-radius: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Template</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Created</th>
              <th style="text-align: right;">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in recentContracts" :key="c.id">
              <td>
                <div style="font-weight: 600;">{{ c.recipient_name || c.ghl_contact_id }}</div>
                <div v-if="c.recipient_email" style="font-size:0.75rem;color:var(--color-text-muted);">{{ c.recipient_email }}</div>
              </td>
              <td>{{ c.template_name || 'Master Services Agreement' }}</td>
              <td>
                <div style="font-size:0.82rem;font-weight:500;color:var(--color-text);">{{ c.assigned_user_name || '—' }}</div>
              </td>
              <td>
                <span class="badge" :class="stateBadgeClass(c.state)">{{ c.state }}</span>
              </td>
              <td style="color: var(--color-text-muted); font-size: 0.8125rem;">{{ formatDate(c.created_at) }}</td>
              <td style="text-align: right;">
                <router-link :to="`/contracts/${c.id}`" class="btn btn-secondary btn-sm" style="font-size: 0.8rem;">
                  Inspect
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const awaitingForm = ref([])
const recentContracts = ref([])

const metrics = ref([
  { label: 'Active Pipeline', value: '0', trend: 'Live', badgeClass: 'badge-sent', subtext: 'In draft or pending intake' },
  { label: 'Sent for Sign', value: '0', trend: 'Awaiting', badgeClass: 'badge-viewed', subtext: 'Links dispatched to clients' },
  { label: 'Completed', value: '0', trend: 'Sealed', badgeClass: 'badge-completed', subtext: 'Signed with SHA-256 cert' },
  { label: 'Awaiting Form', value: '0', trend: 'Action', badgeClass: 'badge-expired', subtext: 'Needs sales form intake' },
])

function stateBadgeClass(state) {
  const map = {
    AWAITING_FORM:          'badge-awaiting_form',
    READY:                  'badge-ready',
    SENT:                   'badge-sent',
    VIEWED:                 'badge-viewed',
    SIGNED:                 'badge-signed',
    SIGNED_PENDING_STORAGE: 'badge-signed',
    COMPLETED:              'badge-completed',
    EXPIRED:                'badge-expired',
    CANCELLED:              'badge-declined',
    DECLINED:               'badge-declined',
  }
  return map[state] || 'badge-draft'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const { data } = await api.get('/contracts?limit=25')
    const list = data.contracts || []
    recentContracts.value = list.slice(0, 10)
    awaitingForm.value = list.filter(c => c.state === 'AWAITING_FORM')

    const sentCount = list.filter(c => ['SENT', 'VIEWED'].includes(c.state)).length
    const completedCount = list.filter(c => c.state === 'COMPLETED').length
    const awaitingCount = awaitingForm.value.length

    metrics.value[0].value = list.length
    metrics.value[1].value = sentCount
    metrics.value[2].value = completedCount
    metrics.value[3].value = awaitingCount
  } catch (err) {
    console.error('Failed to load dashboard:', err)
  } finally {
    loading.value = false
  }
})
</script>
