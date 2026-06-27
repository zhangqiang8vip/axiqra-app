<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { workspaceApi } from '@/api'
import { Card, DataState } from '@/components'
import type { Workspace, MemberRole } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()

const workspaces = ref<Workspace[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentWorkspace = ref<Workspace | null>(null)
const activeTab = ref<'overview' | 'members' | 'settings'>('overview')

// Mock enterprise data
const enterpriseStats = ref({
  totalMembers: 0,
  totalProjects: 0,
  totalSolutions: 0,
  storageUsed: '0 MB'
})

const pendingInvites = ref<Array<{ id: number; email: string; role: MemberRole; invitedAt: string }>>([])

onMounted(async () => {
  loading.value = true
  try {
    workspaces.value = await workspaceApi.list()
    const enterpriseWs = workspaces.value.find(ws => ws.workspaceType === 'enterprise') || workspaces.value[0]
    currentWorkspace.value = enterpriseWs || null
    
    if (currentWorkspace.value) {
      const members = await workspaceApi.getMembers(currentWorkspace.value.id)
      enterpriseStats.value.totalMembers = members?.length || 0
    }
  } catch (err: any) {
    error.value = err?.message || t('enterprise.loadError')
  } finally {
    loading.value = false
  }
})

function switchWorkspace(ws: Workspace) {
  currentWorkspace.value = ws
  authStore.setCurrentWorkspace(ws.id)
}

async function loadMembers() {
  if (!currentWorkspace.value) return
  try {
    const members = await workspaceApi.getMembers(currentWorkspace.value.id)
    enterpriseStats.value.totalMembers = members?.length || 0
  } catch (err) {
    console.error('Failed to load members:', err)
  }
}

function setTab(tab: 'overview' | 'members' | 'settings') {
  activeTab.value = tab
  if (tab === 'members') {
    loadMembers()
  }
}

const isEnterprise = computed(() => currentWorkspace.value?.workspaceType === 'enterprise')
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('enterprise.title') }}</h1>

    <DataState :loading="loading" :error="error">
      <div v-if="currentWorkspace" class="enterprise-layout">
        <!-- Workspace Selector -->
        <Card :title="t('enterprise.currentWorkspace')">
          <div class="ws-selector">
            <div class="ws-info">
              <span class="ws-name">{{ currentWorkspace.workspaceName }}</span>
              <span class="ws-type" :class="{ 'ws-type--enterprise': isEnterprise }">
                {{ t(`workspace.type.${currentWorkspace.workspaceType}`) }}
              </span>
            </div>
          </div>
        </Card>

        <!-- Tab Navigation -->
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ 'tab--active': activeTab === 'overview' }"
            @click="setTab('overview')"
          >
            {{ t('enterprise.tabs.overview') }}
          </button>
          <button 
            class="tab" 
            :class="{ 'tab--active': activeTab === 'members' }"
            @click="setTab('members')"
          >
            {{ t('enterprise.tabs.members') }}
          </button>
          <button 
            class="tab" 
            :class="{ 'tab--active': activeTab === 'settings' }"
            @click="setTab('settings')"
          >
            {{ t('enterprise.tabs.settings') }}
          </button>
        </div>

        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-content">
          <div class="stats-grid">
            <Card :title="t('enterprise.stats.members')">
              <div class="stat-value">{{ enterpriseStats.totalMembers }}</div>
            </Card>
            <Card :title="t('enterprise.stats.projects')">
              <div class="stat-value">{{ enterpriseStats.totalProjects }}</div>
            </Card>
            <Card :title="t('enterprise.stats.solutions')">
              <div class="stat-value">{{ enterpriseStats.totalSolutions }}</div>
            </Card>
            <Card :title="t('enterprise.stats.storage')">
              <div class="stat-value">{{ enterpriseStats.storageUsed }}</div>
            </Card>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="tab-content">
          <Card :title="t('enterprise.members.title')">
            <div class="members-section">
              <div class="section-header">
                <h3>{{ t('enterprise.members.list') }}</h3>
                <button class="btn btn--primary btn--sm">
                  {{ t('enterprise.members.invite') }}
                </button>
              </div>
              <p class="members-empty">{{ t('enterprise.members.empty') }}</p>
            </div>
          </Card>

          <Card v-if="pendingInvites.length > 0" :title="t('enterprise.members.pendingInvites')">
            <div class="pending-list">
              <div v-for="invite in pendingInvites" :key="invite.id" class="pending-item">
                <span>{{ invite.email }}</span>
                <span class="badge">{{ invite.role }}</span>
                <button class="btn btn--ghost btn--sm">{{ t('common.cancel') }}</button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-content">
          <Card :title="t('enterprise.settings.general')">
            <div class="settings-form">
              <div class="form-group">
                <label>{{ t('enterprise.settings.workspaceName') }}</label>
                <input type="text" :value="currentWorkspace.workspaceName" class="input" readonly />
              </div>
              <div class="form-group">
                <label>{{ t('enterprise.settings.visibility') }}</label>
                <select class="input">
                  <option value="enterprise">{{ t('visibility.enterprise') }}</option>
                  <option value="private">{{ t('visibility.private') }}</option>
                </select>
              </div>
            </div>
          </Card>

          <Card :title="t('enterprise.settings.security')">
            <div class="settings-form">
              <div class="setting-row">
                <div>
                  <h4>{{ t('enterprise.settings.sso') }}</h4>
                  <p>{{ t('enterprise.settings.ssoDesc') }}</p>
                </div>
                <button class="btn btn--secondary btn--sm">{{ t('common.edit') }}</button>
              </div>
              <div class="setting-row">
                <div>
                  <h4>{{ t('enterprise.settings.auditLog') }}</h4>
                  <p>{{ t('enterprise.settings.auditLogDesc') }}</p>
                </div>
                <button class="btn btn--secondary btn--sm">{{ t('common.edit') }}</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-lg); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-6); }

.enterprise-layout { display: flex; flex-direction: column; gap: var(--space-4); }

.ws-selector { display: flex; justify-content: space-between; align-items: center; }
.ws-info { display: flex; gap: var(--space-3); align-items: center; }
.ws-name { font-weight: 600; }
.ws-type { 
  font-size: var(--font-size-sm); 
  color: var(--color-text-muted);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}
.ws-type--enterprise { 
  background: var(--color-primary);
  color: white;
}

.tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--color-border); }
.tab { 
  padding: var(--space-3) var(--space-4); 
  background: none; 
  border: none; 
  cursor: pointer;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab:hover { color: var(--color-text-primary); }
.tab--active { 
  color: var(--color-primary); 
  border-bottom-color: var(--color-primary);
}

.tab-content { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
.stat-value { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-primary); }

.members-section { display: flex; flex-direction: column; gap: var(--space-4); }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header h3 { margin: 0; }
.members-empty { color: var(--color-text-muted); text-align: center; padding: var(--space-6); }

.pending-list { display: flex; flex-direction: column; gap: var(--space-2); }
.pending-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2); }
.badge { 
  font-size: var(--font-size-xs); 
  padding: var(--space-1) var(--space-2); 
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.settings-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-group label { font-weight: 500; font-size: var(--font-size-sm); }
.input { 
  padding: var(--space-3); 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}
.input:focus { outline: none; border-color: var(--color-primary); }

.setting-row { display: flex; justify-content: space-between; align-items: center; }
.setting-row h4 { margin: 0 0 var(--space-1) 0; }
.setting-row p { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-sm); }

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
.btn--ghost { background: transparent; color: var(--color-text-muted); }
.btn--ghost:hover { color: var(--color-error); }
</style>
