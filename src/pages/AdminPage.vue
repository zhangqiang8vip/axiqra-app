<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components'

const { t } = useI18n()

const loading = ref(true)
const activeSection = ref<'overview' | 'users' | 'content' | 'audit'>('overview')

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalSolutions: number
  totalTraces: number
  pendingReviews: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

interface RecentActivity {
  id: number
  type: 'user' | 'content' | 'system'
  action: string
  target: string
  user: string
  timestamp: string
}

const stats = ref<SystemStats>({
  totalUsers: 0,
  activeUsers: 0,
  totalSolutions: 0,
  totalTraces: 0,
  pendingReviews: 0,
  systemHealth: 'healthy'
})

const recentActivities = ref<RecentActivity[]>([])
const pendingUsers = ref<Array<{ id: number; username: string; email: string; requestedAt: string }>>([])

onMounted(async () => {
  loading.value = true
  try {
    // Mock data - replace with actual API calls
    stats.value = {
      totalUsers: 1245,
      activeUsers: 389,
      totalSolutions: 567,
      totalTraces: 2341,
      pendingReviews: 12,
      systemHealth: 'healthy'
    }

    recentActivities.value = [
      { id: 1, type: 'content', action: 'Approved', target: 'Solution #234', user: 'admin', timestamp: '2024-06-25T14:30:00Z' },
      { id: 2, type: 'user', action: 'User registered', target: 'user@example.com', user: 'system', timestamp: '2024-06-25T14:15:00Z' },
      { id: 3, type: 'content', action: 'Quarantined', target: 'Case #89', user: 'moderator', timestamp: '2024-06-25T13:45:00Z' },
      { id: 4, type: 'system', action: 'Cache cleared', target: 'search-cache', user: 'system', timestamp: '2024-06-25T12:00:00Z' },
      { id: 5, type: 'user', action: 'Role changed', target: 'editor', user: 'admin', timestamp: '2024-06-25T11:30:00Z' },
    ]

    pendingUsers.value = [
      { id: 1, username: 'newuser1', email: 'newuser1@example.com', requestedAt: '2024-06-25T10:00:00Z' },
      { id: 2, username: 'newuser2', email: 'newuser2@example.com', requestedAt: '2024-06-24T16:00:00Z' },
    ]
  } catch (err) {
    console.error('Failed to load admin data:', err)
  } finally {
    loading.value = false
  }
})

function setSection(section: 'overview' | 'users' | 'content' | 'audit') {
  activeSection.value = section
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

function approveUser(id: number) {
  console.log('Approve user:', id)
}

function rejectUser(id: number) {
  console.log('Reject user:', id)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.title') }}</h1>
      <div class="header-actions">
        <span class="health-badge" :class="`health--${stats.systemHealth}`">
          {{ t(`admin.health.${stats.systemHealth}`) }}
        </span>
      </div>
    </div>

    <!-- Section Navigation -->
    <div class="nav-tabs">
      <button 
        class="nav-tab" 
        :class="{ 'nav-tab--active': activeSection === 'overview' }"
        @click="setSection('overview')"
      >
        {{ t('admin.sections.overview') }}
      </button>
      <button 
        class="nav-tab" 
        :class="{ 'nav-tab--active': activeSection === 'users' }"
        @click="setSection('users')"
      >
        {{ t('admin.sections.users') }}
      </button>
      <button 
        class="nav-tab" 
        :class="{ 'nav-tab--active': activeSection === 'content' }"
        @click="setSection('content')"
      >
        {{ t('admin.sections.content') }}
      </button>
      <button 
        class="nav-tab" 
        :class="{ 'nav-tab--active': activeSection === 'audit' }"
        @click="setSection('audit')"
      >
        {{ t('admin.sections.audit') }}
      </button>
    </div>

    <!-- Overview Section -->
    <div v-if="activeSection === 'overview'" class="section">
      <div class="stats-grid">
        <Card>
          <div class="stat-card">
            <span class="stat-label">{{ t('admin.stats.totalUsers') }}</span>
            <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
          </div>
        </Card>
        <Card>
          <div class="stat-card">
            <span class="stat-label">{{ t('admin.stats.activeUsers') }}</span>
            <span class="stat-value">{{ stats.activeUsers.toLocaleString() }}</span>
          </div>
        </Card>
        <Card>
          <div class="stat-card">
            <span class="stat-label">{{ t('admin.stats.totalSolutions') }}</span>
            <span class="stat-value">{{ stats.totalSolutions.toLocaleString() }}</span>
          </div>
        </Card>
        <Card>
          <div class="stat-card">
            <span class="stat-label">{{ t('admin.stats.totalTraces') }}</span>
            <span class="stat-value">{{ stats.totalTraces.toLocaleString() }}</span>
          </div>
        </Card>
      </div>

      <Card :title="t('admin.recentActivity')">
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <span class="activity-icon" :class="`icon--${activity.type}`">
              <svg v-if="activity.type === 'user'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <svg v-else-if="activity.type === 'content'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.33A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.33A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.33a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.33a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            <div class="activity-content">
              <span class="activity-action">{{ activity.action }}</span>
              <span class="activity-target">{{ activity.target }}</span>
            </div>
            <div class="activity-meta">
              <span class="activity-user">{{ activity.user }}</span>
              <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Users Section -->
    <div v-if="activeSection === 'users'" class="section">
      <Card :title="t('admin.pendingApprovals')">
        <div v-if="pendingUsers.length > 0" class="pending-list">
          <div v-for="user in pendingUsers" :key="user.id" class="pending-item">
            <div class="user-info">
              <strong>{{ user.username }}</strong>
              <span>{{ user.email }}</span>
              <span class="time-ago">{{ formatDate(user.requestedAt) }}</span>
            </div>
            <div class="user-actions">
              <button class="btn btn--primary btn--sm" @click="approveUser(user.id)">
                {{ t('admin.approve') }}
              </button>
              <button class="btn btn--danger btn--sm" @click="rejectUser(user.id)">
                {{ t('admin.reject') }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          {{ t('admin.noPendingUsers') }}
        </div>
      </Card>

      <Card :title="t('admin.allUsers')">
        <p class="placeholder">{{ t('admin.userListPlaceholder') }}</p>
      </Card>
    </div>

    <!-- Content Section -->
    <div v-if="activeSection === 'content'" class="section">
      <Card :title="t('admin.contentModeration')">
        <div class="moderation-stats">
          <div class="mod-stat">
            <span class="mod-value">{{ stats.pendingReviews }}</span>
            <span class="mod-label">{{ t('admin.pendingReviews') }}</span>
          </div>
        </div>
        <p class="placeholder">{{ t('admin.contentListPlaceholder') }}</p>
      </Card>
    </div>

    <!-- Audit Section -->
    <div v-if="activeSection === 'audit'" class="section">
      <Card :title="t('admin.auditLog')">
        <p class="placeholder">{{ t('admin.auditLogPlaceholder') }}</p>
      </Card>

      <Card :title="t('admin.exportLogs')">
        <div class="export-options">
          <button class="btn btn--secondary">{{ t('admin.exportCsv') }}</button>
          <button class="btn btn--secondary">{{ t('admin.exportJson') }}</button>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-xl); margin: 0 auto; padding: var(--space-6) var(--space-4); }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin: 0; }

.health-badge { 
  padding: var(--space-1) var(--space-3); 
  border-radius: var(--radius-full); 
  font-size: var(--font-size-sm); 
  font-weight: 500;
}
.health--healthy { background: rgba(34, 197, 94, 0.1); color: var(--color-success); }
.health--warning { background: rgba(251, 191, 36, 0.1); color: var(--color-warning); }
.health--critical { background: rgba(239, 68, 68, 0.1); color: var(--color-error); }

.nav-tabs { display: flex; gap: var(--space-1); margin-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
.nav-tab { 
  padding: var(--space-3) var(--space-4); 
  background: none; 
  border: none; 
  cursor: pointer;
  color: var(--color-text-muted);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.nav-tab:hover { color: var(--color-text-primary); }
.nav-tab--active { 
  color: var(--color-primary); 
  border-bottom-color: var(--color-primary);
}

.section { display: flex; flex-direction: column; gap: var(--space-4); }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
.stat-card { display: flex; flex-direction: column; gap: var(--space-2); text-align: center; }
.stat-label { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.stat-value { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-primary); }

.activity-list { display: flex; flex-direction: column; }
.activity-item { 
  display: flex; 
  align-items: center; 
  gap: var(--space-3); 
  padding: var(--space-3) 0; 
  border-bottom: 1px solid var(--color-border);
}
.activity-item:last-child { border-bottom: none; }
.activity-icon { flex-shrink: 0; }
.icon--user { color: var(--color-primary); }
.icon--content { color: var(--color-success); }
.icon--system { color: var(--color-warning); }
.activity-content { flex: 1; display: flex; flex-direction: column; }
.activity-action { font-weight: 500; }
.activity-target { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.activity-meta { display: flex; flex-direction: column; align-items: flex-end; font-size: var(--font-size-xs); color: var(--color-text-muted); }

.pending-list { display: flex; flex-direction: column; gap: var(--space-3); }
.pending-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: var(--space-3); 
  background: var(--color-bg-secondary); 
  border-radius: var(--radius-md);
}
.user-info { display: flex; flex-direction: column; gap: var(--space-1); }
.user-info strong { color: var(--color-text-primary); }
.user-info span { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.user-actions { display: flex; gap: var(--space-2); }

.moderation-stats { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
.mod-stat { display: flex; flex-direction: column; align-items: center; }
.mod-value { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-warning); }
.mod-label { font-size: var(--font-size-sm); color: var(--color-text-muted); }

.export-options { display: flex; gap: var(--space-3); }

.empty-state { text-align: center; padding: var(--space-6); color: var(--color-text-muted); }
.placeholder { color: var(--color-text-muted); text-align: center; padding: var(--space-4); }

/* Buttons */
.btn { 
  padding: var(--space-2) var(--space-4); 
  border-radius: var(--radius-md); 
  font-weight: 500; 
  cursor: pointer; 
  border: none;
  transition: all 0.2s;
}
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
.btn--primary { background: var(--color-primary); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.btn--secondary:hover { background: var(--color-border); }
.btn--danger { background: transparent; color: var(--color-error); }
.btn--danger:hover { background: rgba(239, 68, 68, 0.1); }
</style>
