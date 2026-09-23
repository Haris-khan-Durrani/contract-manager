import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard',              name: 'Dashboard',         component: () => import('../views/DashboardView.vue') },
      { path: 'contracts',              name: 'Contracts',         component: () => import('../views/ContractsView.vue') },
      { path: 'contracts/new',          name: 'CreateContract',    component: () => import('../views/CreateContractView.vue') },
      { path: 'contracts/:id',          name: 'ContractDetail',    component: () => import('../views/ContractDetailView.vue') },
      { path: 'templates',              name: 'Templates',         component: () => import('../views/TemplatesView.vue') },
      { path: 'templates/:id/builder',  name: 'TemplateBuilder',   component: () => import('../views/TemplateBuilderView.vue'), meta: { roles: ['ADMIN', 'SUPER_ADMIN'] } },
      { path: 'forms',                  name: 'Forms',             component: () => import('../views/FormsView.vue') },
      { path: 'forms/:id/builder',      name: 'FormBuilder',       component: () => import('../views/FormBuilderView.vue'), meta: { roles: ['ADMIN', 'SUPER_ADMIN'] } },
      { path: 'automation',             name: 'Automation',        component: () => import('../views/AutomationView.vue'), meta: { roles: ['ADMIN', 'SUPER_ADMIN'] } },
      { path: 'ghl',                    name: 'GHL',               component: () => import('../views/GHLView.vue'), meta: { roles: ['ADMIN', 'SUPER_ADMIN'] } },
      { path: 'admin/users',            name: 'UsersAccess',       component: () => import('../views/UsersAccessView.vue'), meta: { roles: ['SUPER_ADMIN', 'ADMIN'] } },
      { path: 'admin/settings',         name: 'Settings',          component: () => import('../views/SettingsView.vue'), meta: { roles: ['SUPER_ADMIN', 'ADMIN'] } },
    ],
  },
  // Public signing portal — no auth required
  {
    path: '/sign/:token',
    name: 'PublicSign',
    component: () => import('../views/PublicSignView.vue'),
  },
  // Public contract verification / QR landing — no auth required
  {
    path: '/verify/:id',
    name: 'PublicVerify',
    component: () => import('../views/PublicVerifyView.vue'),
  },
  // Direct slash-based auto-login / SSO routes
  {
    path: '/dashboard/:locationId/:userId/:token?',
    name: 'DashboardSlashAuth',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/auth/:locationId/:userId/:token?',
    name: 'AuthSlashAuth',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/sso/:locationId/:userId/:token?',
    name: 'SsoSlashAuth',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('../views/AccessDeniedView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard: require authenticated session or auto-login via URL params
router.beforeEach(async (to) => {
  // Allow public signing portal and public verification page
  if (to.path.startsWith('/sign/') || to.path.startsWith('/verify/') || to.name === 'AccessDenied') return true

  const auth = useAuthStore()

  // Check URL path parameters (/dashboard/:locationId/:userId/:token) or query parameters
  const locationId = to.params.locationId || to.query.locationId || to.query.locationid || to.query.location_id
  const userId     = to.params.userId     || to.query.userId     || to.query.userid     || to.query.user_id
  const privateToken = to.params.token   || to.query.privateToken || to.query.privatetoken || to.query.token || to.query.private_token

  if (userId && locationId) {
    const success = await auth.checkUrlParams({
      userId,
      locationId,
      privateToken,
    })
    if (success) {
      // Remove sensitive tokens from URL query for security & clean URL
      const cleanQuery = { ...to.query }
      delete cleanQuery.userId
      delete cleanQuery.userid
      delete cleanQuery.user_id
      delete cleanQuery.locationId
      delete cleanQuery.locationid
      delete cleanQuery.location_id
      delete cleanQuery.privateToken
      delete cleanQuery.privatetoken
      delete cleanQuery.token
      delete cleanQuery.private_token
      delete cleanQuery.redirect

      const targetPath = (to.name === 'Login' || to.path === '/login' || to.path === '/' || to.params.locationId)
        ? (to.query.redirect || '/dashboard')
        : to.path

      return { path: targetPath, query: cleanQuery, replace: true }
    }
  }

  // If already on /login and authenticated, forward to dashboard
  if (to.name === 'Login') {
    if (auth.isAuthenticated) return { name: 'Dashboard' }
    return true
  }

  // If not authenticated in memory, attempt to restore from localStorage session token
  if (!auth.isAuthenticated) {
    await auth.verifySession()
  }

  // If still not authenticated, redirect to Login view
  if (!auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Role check for restricted admin routes
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'AccessDenied' }
  }

  return true
})

export default router
