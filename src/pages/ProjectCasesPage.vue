<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { projectCaseApi } from '@/api'
import { DataState } from '@/components'
import type { ProjectCase } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const cases = ref<ProjectCase[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const statusFilter = ref<string>('')

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '进行中' },
  { value: 'submitted', label: '已提交' },
  { value: 'published', label: '已发布' },
]

const filteredCases = computed(() => {
  if (!statusFilter.value) return cases.value
  return cases.value.filter(c => c.status === statusFilter.value)
})

async function loadCases() {
  loading.value = true
  try {
    const workspaceId = authStore.currentWorkspaceId || undefined
    const data = await projectCaseApi.list({ 
      page: 1, 
      pageSize: 50,
      workspaceId 
    })
    // 兼容 PageResponse 和数组格式
    cases.value = data.records || data.list || []
  } catch (err: any) {
    error.value = err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function viewCase(id: number) {
  router.push({ name: 'project-case-detail', params: { id } })
}

function getStatusClass(status: string) {
  switch (status) {
    case 'draft': return 'status--draft'
    case 'active': return 'status--active'
    case 'submitted': return 'status--submitted'
    case 'published': return 'status--published'
    default: return ''
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft': return '草稿'
    case 'active': return '进行中'
    case 'submitted': return '已提交'
    case 'published': return '已发布'
    default: return status || '未知'
  }
}

onMounted(() => {
  loadCases()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">项目列表</h1>
        <p class="page-subtitle">管理你的项目和案例</p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'trace-new' })">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建项目
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>状态筛选</label>
        <select v-model="statusFilter" class="form-select">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-info">
        共 {{ filteredCases.length }} 个项目
      </div>
    </div>

    <DataState 
      :loading="loading" 
      :error="error"
      :empty="!loading && !error && filteredCases.length === 0"
      empty-message="暂无项目"
    >
      <div v-if="filteredCases.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>开始你的第一个项目</h3>
        <p>从 Trace 创建案例，或者浏览公开案例获取灵感</p>
        <div class="empty-actions">
          <button class="btn btn-primary" @click="router.push({ name: 'trace-new' })">
            新建 Trace
          </button>
          <button class="btn btn-secondary" @click="router.push('/public-cases')">
            浏览公开案例
          </button>
        </div>
      </div>

      <div v-else class="cases-grid">
        <div 
          v-for="c in filteredCases" 
          :key="c.id" 
          class="case-card"
          @click="viewCase(c.id)"
        >
          <div class="case-card__header">
            <span class="case-card__title">{{ c.title || '未命名项目' }}</span>
            <span class="case-card__status" :class="getStatusClass(c.status || '')">
              {{ getStatusLabel(c.status) }}
            </span>
          </div>
          <div class="case-card__body">
            <p class="case-card__desc">
              {{ c.problemStatement?.substring(0, 150) || '暂无描述' }}
              <span v-if="c.problemStatement?.length > 150">...</span>
            </p>
          </div>
          <div class="case-card__footer">
            <div class="case-card__meta">
              <span v-if="c.techStack" class="case-card__tag">{{ c.techStack }}</span>
              <span v-if="c.riskLevel" class="case-card__risk" :class="`risk--${c.riskLevel?.toLowerCase()}`">
                {{ c.riskLevel }}
              </span>
            </div>
            <div class="case-card__date">
              {{ c.gmtCreate || c.createdAt ? new Date(c.gmtCreate || c.createdAt || '').toLocaleDateString() : '' }}
            </div>
          </div>
        </div>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-1);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.filter-group label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.form-select {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
}

.filter-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--color-bg-secondary);
  border-radius: 50%;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--space-2);
}

.empty-state p {
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6);
}

.empty-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

/* 案例网格 */
.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-4);
}

.case-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.case-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px var(--shadow-md);
  transform: translateY(-2px);
}

.case-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.case-card__title {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  flex: 1;
  margin-right: var(--space-2);
}

.case-card__status {
  font-size: var(--font-size-xs);
  font-weight: 500;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.status--draft { background: var(--color-bg-secondary); color: var(--color-text-secondary); }
.status--active { background: var(--color-primary-light); color: var(--color-primary); }
.status--submitted { background: var(--color-warning-light); color: var(--color-warning); }
.status--published { background: var(--color-success-light); color: var(--color-success); }

.case-card__body {
  margin-bottom: var(--space-4);
}

.case-card__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.case-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-card__meta {
  display: flex;
  gap: var(--space-2);
}

.case-card__tag {
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.case-card__risk {
  font-size: var(--font-size-xs);
  font-weight: 500;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
}

.risk--r1 { background: var(--color-success-light); color: var(--color-success); }
.risk--r2 { background: var(--color-warning-light); color: var(--color-warning); }
.risk--r3 { background: var(--color-error-light); color: var(--color-error); }

.case-card__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-tertiary);
}

/* 响应式 */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .filter-bar {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
  
  .cases-grid {
    grid-template-columns: 1fr;
  }
}
</style>
