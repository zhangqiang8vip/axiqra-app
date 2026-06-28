<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { traceApi, seedApi, solutionApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const traces = ref<any[]>([])
const seeds = ref<any[]>([])
const solutions = ref<any[]>([])

const stats = ref([
  { label: '工程轨迹', value: 0, icon: 'trace', change: '+0' },
  { label: '候选种子', value: 0, icon: 'seed', change: '+0' },
  { label: '解决方案', value: 0, icon: 'solution', change: '+0' },
  { label: '反馈统计', value: 0, icon: 'feedback', change: '+0' },
])

const workspace = computed(() => {
  if (authStore.currentWorkspace) return authStore.currentWorkspace
  return authStore.user?.workspaces?.[0] || null
})

const quickActions = [
  { label: '搜索', icon: 'search', route: '/search', color: 'primary' },
  { label: '新建轨迹', icon: 'plus', route: '/traces/new', color: 'success' },
  { label: '接入AI', icon: 'ai', route: '/connect', color: 'purple' },
  { label: '浏览案例', icon: 'case', route: '/public-cases', color: 'orange' },
]

const navItems = [
  { label: '工作空间', icon: 'home', route: '/workspace' },
  { label: '项目列表', icon: 'folder', route: '/project-cases' },
  { label: '方案中心', icon: 'solution', route: '/solutions' },
  { label: '公开案例', icon: 'public', route: '/public-cases' },
  { label: '贡献中心', icon: 'contribution', route: '/contribution' },
]

async function loadDashboard() {
  loading.value = true
  const workspaceId = authStore.currentWorkspaceId || undefined

  const [traceResult, seedResult, solutionResult] = await Promise.allSettled([
    traceApi.list({ workspaceId, page: 1, pageSize: 5 }),
    seedApi.list({ workspaceId, page: 1, pageSize: 5 }),
    solutionApi.list({ workspaceId, page: 1, pageSize: 5 }),
  ])

  if (traceResult.status === 'fulfilled') {
    const data = traceResult.value
    traces.value = Array.isArray(data) ? data : (data.list || [])
    const traceStat = stats.value[0]
    if (traceStat) traceStat.value = traces.value.length
  }

  if (seedResult.status === 'fulfilled') {
    const data = seedResult.value
    seeds.value = Array.isArray(data) ? data : (data.list || [])
    const seedStat = stats.value[1]
    if (seedStat) seedStat.value = seeds.value.length
  }

  if (solutionResult.status === 'fulfilled') {
    const data = solutionResult.value
    solutions.value = Array.isArray(data) ? data : (data.list || [])
    const solutionStat = stats.value[2]
    if (solutionStat) solutionStat.value = solutions.value.length
  }

  loading.value = false
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="dashboard">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-info">
          <h1 class="welcome-title">{{ authStore.user?.username || '用户' }}，欢迎回来</h1>
          <p class="welcome-subtitle">{{ workspace?.workspaceName || '个人空间' }}</p>
        </div>
        <button class="btn-new" @click="router.push('/traces/new')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建轨迹
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-change">{{ stat.change }}</span>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="nav-section">
          <h3 class="nav-section-title">快速访问</h3>
          <nav class="nav-list">
            <router-link 
              v-for="item in navItems" 
              :key="item.route"
              :to="item.route"
              class="nav-item"
            >
              <svg v-if="item.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <svg v-else-if="item.icon === 'folder'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <svg v-else-if="item.icon === 'solution'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <svg v-else-if="item.icon === 'public'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <svg v-else-if="item.icon === 'contribution'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ item.label }}
            </router-link>
          </nav>
        </div>

        <div class="nav-section">
          <h3 class="nav-section-title">快捷操作</h3>
          <div class="quick-actions">
            <button 
              v-for="action in quickActions" 
              :key="action.route"
              class="quick-action-btn"
              :class="`quick-action-btn--${action.color}`"
              @click="router.push(action.route)"
            >
              <svg v-if="action.icon === 'search'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <svg v-else-if="action.icon === 'plus'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <svg v-else-if="action.icon === 'ai'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
              <svg v-else-if="action.icon === 'case'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content-area">
        <!-- 最近轨迹 -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">最近轨迹</h3>
            <router-link to="/traces/new" class="card-action">新建</router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="skeleton-list">
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
              </div>
            </div>
            <div v-else-if="traces.length" class="item-list">
              <div v-for="trace in traces.slice(0, 5)" :key="trace.id" class="list-item">
                <div class="item-icon item-icon--trace">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-title">{{ trace.taskGoal || '未命名' }}</span>
                  <span class="item-meta">{{ trace.riskLevel || 'R1' }}</span>
                </div>
                <div class="item-status" :class="`item-status--${trace.userConfirmationStatus || 'pending'}`"></div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无轨迹记录</p>
              <router-link to="/traces/new">立即创建</router-link>
            </div>
          </div>
        </div>

        <!-- 候选种子 -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">候选种子</h3>
            <router-link to="/seeds/new" class="card-action">新建</router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="skeleton-list">
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
              </div>
            </div>
            <div v-else-if="seeds.length" class="item-list">
              <div v-for="seed in seeds.slice(0, 5)" :key="seed.id" class="list-item">
                <div class="item-icon item-icon--seed">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 20h10"/>
                    <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                  </svg>
                </div>
                <div class="item-content">
                  <span class="item-title">{{ seed.taskGoal || seed.query || '未命名' }}</span>
                  <span class="item-badge">{{ seed.status }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无候选种子</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px 32px;
  margin-bottom: 24px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-new:hover {
  background: var(--color-primary-hover);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stat-change {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
}

.nav-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  text-decoration: none;
}

.nav-item svg {
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.nav-item:hover svg {
  color: var(--color-primary);
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quick-action-btn--primary { background: var(--color-primary-light); border-color: transparent; }
.quick-action-btn--primary:hover { background: var(--color-primary); color: white; }

.quick-action-btn--success { background: var(--color-success-light); border-color: transparent; }
.quick-action-btn--success:hover { background: var(--color-success); color: white; }

.quick-action-btn--purple { background: var(--color-primary-light); border-color: transparent; }
.quick-action-btn--purple:hover { background: var(--color-primary); color: white; }

.quick-action-btn--orange { background: var(--color-warning-light); border-color: transparent; }
.quick-action-btn--orange:hover { background: var(--color-warning); color: white; }

/* 内容区 */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.card-action {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.card-action:hover {
  text-decoration: underline;
}

.card-body {
  padding: 16px 20px;
}

/* 列表项 */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.list-item:hover {
  background: var(--color-bg-tertiary);
}

.item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.item-icon--trace {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.item-icon--seed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.item-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--color-bg);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  width: fit-content;
}

.item-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-status--confirmed { background: var(--color-success); }
.item-status--pending { background: var(--color-warning); }
.item-status--processing { background: var(--color-primary); }

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--color-text-tertiary);
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 14px;
}

.empty-state a {
  font-size: 13px;
  color: var(--color-primary);
}

/* 加载状态 */
.loading-state {
  padding: 8px 0;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-item {
  height: 60px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .nav-section {
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
