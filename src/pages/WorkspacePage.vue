<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { workspaceApi, type WorkspaceMember } from '@/api/workspaces'
import { Card, DataState } from '@/components'
import type { Workspace } from '@/types'
import { WorkspaceType } from '@/types'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const workspaces = ref<Workspace[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentWorkspace = ref<Workspace | null>(null)
const showCreateModal = ref(false)
const newWorkspaceName = ref('')
const newWorkspaceType = ref<WorkspaceType>(WorkspaceType.PERSONAL)
const creating = ref(false)

const members = ref<WorkspaceMember[]>([])
const membersLoading = ref(false)
const showInviteModal = ref(false)
const inviteUsername = ref('')
const inviteRole = ref('member')
const inviting = ref(false)

const activeTab = ref<'overview' | 'members'>('overview')

const workspaceTypeOptions = [
  { value: WorkspaceType.PERSONAL, label: '个人空间' },
  { value: WorkspaceType.TEAM, label: '团队空间' },
  { value: WorkspaceType.ENTERPRISE, label: '企业空间' },
]

const isOwner = computed(() => currentWorkspace.value?.myRole === 'owner')
const isAdmin = computed(() => {
  const role = currentWorkspace.value?.myRole
  return role === 'owner' || role === 'admin'
})

onMounted(async () => {
  loading.value = true
  try {
    workspaces.value = await workspaceApi.list()
    currentWorkspace.value = authStore.currentWorkspace || workspaces.value[0] || null
    if (!authStore.currentWorkspaceId && workspaces.value.length > 0) {
      authStore.setCurrentWorkspace(workspaces.value[0].id)
      currentWorkspace.value = workspaces.value[0]
    }
    if (currentWorkspace.value?.id) {
      await loadMembers()
    }
  } catch (err: any) {
    error.value = err?.message || '加载失败'
  } finally {
    loading.value = false
  }
})

async function loadMembers() {
  if (!currentWorkspace.value?.id) return
  membersLoading.value = true
  try {
    members.value = await workspaceApi.getMembers(currentWorkspace.value.id)
  } catch (err: any) {
    console.error('加载成员失败:', err)
  } finally {
    membersLoading.value = false
  }
}

function switchWorkspace(ws: Workspace) {
  currentWorkspace.value = ws
  authStore.setCurrentWorkspace(ws.id)
  activeTab.value = 'overview'
  loadMembers()
}

async function createWorkspace() {
  if (!newWorkspaceName.value.trim()) return
  
  creating.value = true
  try {
    const newWs = await workspaceApi.create({
      workspaceName: newWorkspaceName.value.trim(),
      workspaceType: newWorkspaceType.value,
    })
    workspaces.value.push(newWs)
    showCreateModal.value = false
    newWorkspaceName.value = ''
    switchWorkspace(newWs)
  } catch (err: any) {
    alert(err?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

async function inviteMember() {
  if (!currentWorkspace.value?.id || !inviteUsername.value.trim()) return
  
  inviting.value = true
  try {
    await workspaceApi.inviteByUsername(currentWorkspace.value.id, inviteUsername.value.trim(), inviteRole.value)
    showInviteModal.value = false
    inviteUsername.value = ''
    inviteRole.value = 'member'
    await loadMembers()
  } catch (err: any) {
    alert(err?.message || '邀请失败')
  } finally {
    inviting.value = false
  }
}

async function removeMember(member: WorkspaceMember) {
  if (!currentWorkspace.value?.id) return
  if (!confirm(`确定要移除成员 "${member.username}" 吗？`)) return
  
  try {
    await workspaceApi.removeMember(currentWorkspace.value.id, member.memberId)
    await loadMembers()
  } catch (err: any) {
    alert(err?.message || '移除失败')
  }
}

async function updateMemberRole(member: WorkspaceMember, newRole: string) {
  if (!currentWorkspace.value?.id) return
  
  try {
    await workspaceApi.updateMemberRole(currentWorkspace.value.id, member.memberId, newRole)
    await loadMembers()
  } catch (err: any) {
    alert(err?.message || '更新失败')
  }
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'owner': return 'role-badge role-badge--owner'
    case 'admin': return 'role-badge role-badge--admin'
    case 'member': return 'role-badge role-badge--member'
    default: return 'role-badge role-badge--viewer'
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'owner': return '所有者'
    case 'admin': return '管理员'
    case 'member': return '成员'
    default: return role
  }
}

function getTypeLabel(type: any) {
  switch (type) {
    case 'personal': return '个人'
    case 'team': return '团队'
    case 'enterprise': return '企业'
    default: return type
  }
}

function getTypeIcon(type: any) {
  switch (type) {
    case 'personal': return 'user'
    case 'team': return 'users'
    case 'enterprise': return 'building'
    default: return 'folder'
  }
}
</script>

<template>
  <div class="workspace-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header animate-slide-up">
        <div class="page-header-info">
          <h1 class="page-title">{{ t('workspace.title') || '工作空间' }}</h1>
          <p class="page-subtitle">管理您的团队和项目空间</p>
        </div>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          创建空间
        </button>
      </div>

      <!-- Workspace Selector -->
      <div class="workspace-selector animate-slide-up">
        <div 
          v-for="ws in workspaces" 
          :key="ws.id" 
          class="ws-chip"
          :class="{ 'ws-chip--active': ws.id === currentWorkspace?.id }"
          @click="switchWorkspace(ws)"
        >
          <div class="ws-chip-icon">
            <svg v-if="getTypeIcon(ws.workspaceType) === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <svg v-else-if="getTypeIcon(ws.workspaceType) === 'users'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <svg v-else-if="getTypeIcon(ws.workspaceType) === 'building'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01"/>
              <path d="M16 6h.01"/>
              <path d="M12 6h.01"/>
              <path d="M12 10h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 10h.01"/>
              <path d="M16 14h.01"/>
              <path d="M8 10h.01"/>
              <path d="M8 14h.01"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span class="ws-chip-name">{{ ws.workspaceName }}</span>
          <span v-if="ws.myRole === 'owner'" class="ws-chip-badge">所有者</span>
        </div>
      </div>

      <DataState :loading="loading" :error="error">
        <!-- Tabs -->
        <div class="tabs animate-slide-up">
          <button 
            class="tab" 
            :class="{ 'tab--active': activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            概览
          </button>
          <button 
            class="tab" 
            :class="{ 'tab--active': activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            成员 ({{ members.length }})
          </button>
        </div>

        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-content">
          <!-- Current Workspace Card -->
          <div v-if="currentWorkspace" class="current-ws-card animate-slide-up">
            <div class="current-ws-bg">
              <div class="ws-orb"></div>
            </div>
            <div class="current-ws-content">
              <div class="current-ws-header">
                <div class="current-ws-info">
                  <h2 class="current-ws-name">{{ currentWorkspace.workspaceName }}</h2>
                  <div class="current-ws-meta">
                    <span :class="getRoleBadgeClass(currentWorkspace.myRole || 'member')">
                      {{ getRoleLabel(currentWorkspace.myRole || 'member') }}
                    </span>
                    <span class="type-tag">{{ getTypeLabel(currentWorkspace.workspaceType) }}</span>
                  </div>
                </div>
                <div class="current-ws-actions">
                  <button class="action-btn" @click="router.push('/traces/new')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    新建 Trace
                  </button>
                  <button class="action-btn" @click="router.push('/project-cases')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    项目列表
                  </button>
                  <button class="action-btn" @click="router.push('/solutions')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    方案列表
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <Card class="quick-actions-card animate-slide-up">
            <template #header>
              <div class="card-header-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                快捷操作
              </div>
            </template>
            <div class="quick-actions">
              <button class="quick-action-btn" @click="router.push('/traces/new')">
                <div class="quick-action-icon quick-action-icon--blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <span>新建 Trace</span>
              </button>
              <button class="quick-action-btn" @click="router.push('/project-cases')">
                <div class="quick-action-icon quick-action-icon--purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span>项目列表</span>
              </button>
              <button class="quick-action-btn" @click="router.push('/solutions')">
                <div class="quick-action-icon quick-action-icon--green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <span>方案列表</span>
              </button>
              <button class="quick-action-btn" @click="router.push('/public-cases')">
                <div class="quick-action-icon quick-action-icon--orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <span>公开案例</span>
              </button>
            </div>
          </Card>

          <!-- All Workspaces -->
          <Card class="workspaces-card animate-slide-up">
            <template #header>
              <div class="card-header-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                所有工作空间
              </div>
            </template>
            <div v-if="workspaces.length === 0" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <p>暂无工作空间</p>
              <button class="btn btn-primary" @click="showCreateModal = true">创建第一个空间</button>
            </div>
            <div v-else class="workspaces-list">
              <div 
                v-for="ws in workspaces" 
                :key="ws.id" 
                class="ws-item"
                :class="{ 'ws-item--active': ws.id === currentWorkspace?.id }"
                @click="switchWorkspace(ws)"
              >
                <div class="ws-item-icon">
                  <svg v-if="getTypeIcon(ws.workspaceType) === 'user'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <svg v-else-if="getTypeIcon(ws.workspaceType) === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                  </svg>
                </div>
                <div class="ws-item-content">
                  <div class="ws-item-header">
                    <span class="ws-name">{{ ws.workspaceName }}</span>
                    <span :class="getRoleBadgeClass(ws.myRole || 'member')">
                      {{ getRoleLabel(ws.myRole || 'member') }}
                    </span>
                  </div>
                  <div class="ws-item-meta">
                    <span class="type-tag">{{ getTypeLabel(ws.workspaceType) }}</span>
                  </div>
                </div>
                <div class="ws-item-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="tab-content">
          <Card class="members-card animate-slide-up">
            <template #header>
              <div class="card-header-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                成员管理
              </div>
            </template>
            <template #header-actions>
              <button v-if="isAdmin" class="btn btn-primary btn-sm" @click="showInviteModal = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                邀请成员
              </button>
            </template>

            <DataState :loading="membersLoading" :error="null">
              <div v-if="members.length === 0" class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <p>暂无成员</p>
              </div>
              <div v-else class="members-list">
                <div v-for="member in members" :key="member.memberId" class="member-item">
                  <div class="member-avatar">
                    <img v-if="member.avatar" :src="member.avatar" :alt="member.username" />
                    <span v-else>{{ member.username?.charAt(0)?.toUpperCase() || '?' }}</span>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.nickname || member.username }}</div>
                    <div class="member-username">@{{ member.username }}</div>
                  </div>
                  <div class="member-role">
                    <select 
                      v-if="isOwner && member.role !== 'owner'"
                      :value="member.role"
                      class="role-select"
                      @change="updateMemberRole(member, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="admin">管理员</option>
                      <option value="member">成员</option>
                    </select>
                    <span v-else :class="getRoleBadgeClass(member.role)">
                      {{ getRoleLabel(member.role) }}
                    </span>
                  </div>
                  <div class="member-actions">
                    <span v-if="member.status === 'active'" class="status-indicator status-indicator--active"></span>
                    <span v-else class="status-indicator status-indicator--inactive"></span>
                    <button 
                      v-if="isAdmin && member.role !== 'owner'"
                      class="btn btn-icon btn-sm"
                      title="移除成员"
                      @click="removeMember(member)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </DataState>
          </Card>
        </div>
      </DataState>

      <!-- Create Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal animate-scale-in">
          <div class="modal-header">
            <h3>创建工作空间</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>空间名称</label>
              <input 
                v-model="newWorkspaceName" 
                type="text" 
                class="input"
                placeholder="输入空间名称"
                @keyup.enter="createWorkspace"
              />
            </div>
            <div class="form-group">
              <label>空间类型</label>
              <select v-model="newWorkspaceType" class="input">
                <option v-for="opt in workspaceTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button class="btn btn-primary" :disabled="creating || !newWorkspaceName.trim()" @click="createWorkspace">
              {{ creating ? '创建中...' : '创建' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Invite Modal -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
        <div class="modal animate-scale-in">
          <div class="modal-header">
            <h3>邀请成员</h3>
            <button class="modal-close" @click="showInviteModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>用户名</label>
              <input 
                v-model="inviteUsername" 
                type="text" 
                class="input"
                placeholder="输入要邀请的用户名"
                @keyup.enter="inviteMember"
              />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="inviteRole" class="input">
                <option value="member">成员</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showInviteModal = false">取消</button>
            <button class="btn btn-primary" :disabled="inviting || !inviteUsername.trim()" @click="inviteMember">
              {{ inviting ? '邀请中...' : '邀请' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace-page {
  min-height: 100vh;
  background: #f8fafc;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-header-info { flex: 1; }

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover { background: #e2e8f0; }

.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  color: #94a3b8;
  border-radius: 0.5rem;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #ef4444;
}

/* Workspace Selector */
.workspace-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ws-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ws-chip:hover {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
}

.ws-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.ws-chip-icon {
  display: flex;
  align-items: center;
}

.ws-chip-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.ws-chip-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;
}

.tab:hover { color: #0f172a; }

.tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Current Workspace Card */
.current-ws-card {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border-radius: 1.25rem;
  padding: 2rem;
  color: white;
  overflow: hidden;
}

.current-ws-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ws-orb {
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -100px;
  right: -50px;
  filter: blur(60px);
}

.current-ws-content {
  position: relative;
  z-index: 2;
}

.current-ws-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.current-ws-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.current-ws-meta {
  display: flex;
  gap: 0.5rem;
}

.role-badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.role-badge--owner { background: rgba(168, 85, 247, 0.5); }
.role-badge--admin { background: rgba(239, 68, 68, 0.5); }
.role-badge--member { background: rgba(34, 197, 94, 0.5); }

.type-tag {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
}

.current-ws-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Card */
:deep(.card) {
  background: white;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.card-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.quick-action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: white;
}

.quick-action-icon--blue { background: var(--color-primary); }
.quick-action-icon--purple { background: var(--color-primary); }
.quick-action-icon--green { background: var(--color-success); }
.quick-action-icon--orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.quick-action-btn span {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
}

/* Workspaces List */
.workspaces-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ws-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ws-item:hover {
  background: #f8fafc;
  border-color: var(--color-primary);
}

.ws-item--active {
  background: rgba(99, 102, 241, 0.05);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.ws-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 0.75rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.ws-item--active .ws-item-icon {
  background: var(--color-primary);
  color: white;
}

.ws-item-content { flex: 1; }

.ws-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.ws-name {
  font-weight: 600;
  color: #0f172a;
}

.ws-item-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.ws-item-arrow {
  color: #cbd5e1;
  transition: transform 0.2s ease;
}

.ws-item:hover .ws-item-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

/* Members List */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  transition: background 0.2s ease;
}

.member-item:hover { background: #f8fafc; }

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info { flex: 1; }

.member-name {
  font-weight: 600;
  color: #0f172a;
}

.member-username {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.member-role {
  display: flex;
  align-items: center;
}

.role-select {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator--active { background: #10b981; }
.status-indicator--inactive { background: #d1d5db; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: #94a3b8;
  text-align: center;
}

.empty-state svg { opacity: 0.5; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child { margin-bottom: 0; }

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  color: #0f172a;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 0 0 1.25rem 1.25rem;
}

/* Animations */
.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Responsive */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .current-ws-header {
    flex-direction: column;
  }
}
</style>
