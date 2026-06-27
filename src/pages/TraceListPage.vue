<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { traceApi } from '@/api'
import { DataState } from '@/components'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const traces = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filterStatus = ref<string>('')

const filteredTraces = computed(() => {
  if (!filterStatus.value) return traces.value
  return traces.value.filter(t => t.userConfirmationStatus === filterStatus.value)
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const defaultStatusConfig = { label: '草稿', color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)' }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: defaultStatusConfig,
  pending: { label: '待确认', color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  confirmed: { label: '已确认', color: 'var(--color-primary)', bg: 'rgba(59, 130, 246, 0.1)' },
  processing: { label: '处理中', color: 'var(--color-info)', bg: 'rgba(59, 130, 246, 0.1)' },
  project_case_created: { label: '案例已创建', color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)' },
  rejected: { label: '已拒绝', color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' },
}

const defaultRiskConfig = { color: 'var(--color-success)' }

const riskConfig: Record<string, { color: string }> = {
  R0: defaultRiskConfig,
  R1: defaultRiskConfig,
  R2: { color: 'var(--color-warning)' },
  R3: { color: 'var(--color-warning)' },
  R4: { color: 'var(--color-error)' },
}

function getStatusStyle(status: string) {
  return statusConfig[status] ?? defaultStatusConfig
}

function getRiskStyle(riskLevel: string) {
  return riskConfig[riskLevel] ?? defaultRiskConfig
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadTraces() {
  loading.value = true
  error.value = null

  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    
    if (authStore.currentWorkspaceId) {
      params.workspaceId = authStore.currentWorkspaceId
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value
    }

    const result = await traceApi.list(params)
    traces.value = result.list || []
    total.value = result.total || 0
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Load failed'
    // Show placeholder data when API is unavailable
    traces.value = generateSampleTraces()
    total.value = traces.value.length
  } finally {
    loading.value = false
  }
}

function generateSampleTraces() {
  return [
    {
      id: 1,
      taskGoal: '修复 Spring Boot 应用启动时的数据库连接池超时问题',
      riskLevel: 'R2',
      userConfirmationStatus: 'confirmed',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      taskGoal: '优化 Kubernetes Pod 调度策略以提升资源利用率',
      riskLevel: 'R3',
      userConfirmationStatus: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      taskGoal: '配置 GitHub Actions 实现自动化测试与部署',
      riskLevel: 'R1',
      userConfirmationStatus: 'draft',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 4,
      taskGoal: '排查 Redis 缓存穿透导致的性能下降问题',
      riskLevel: 'R2',
      userConfirmationStatus: 'project_case_created',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]
}

function goToDetail(id: number) {
  router.push({ name: 'trace-detail', params: { id: String(id) } })
}

function goToNew() {
  router.push({ name: 'trace-new' })
}

function goToConfirm(id: number) {
  router.push({ name: 'trace-confirm', params: { id } })
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadTraces()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadTraces()
  }
}

async function deleteTrace(id: number, event: Event) {
  event.stopPropagation()
  
  if (!confirm('确定要删除这个 Trace 吗？')) return
  
  try {
    await traceApi.delete(id)
    traces.value = traces.value.filter(t => t.id !== id)
    total.value--
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || '删除失败')
  }
}

function setFilter(status: string) {
  filterStatus.value = status
  currentPage.value = 1
  loadTraces()
}

onMounted(loadTraces)
</script>

<template>
  <div class="traces-page">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('trace.list.title') }}</h1>
        <p class="page-desc">{{ t('trace.list.description') }}</p>
      </div>
      <button class="btn btn--primary" @click="goToNew">
        + {{ t('trace.list.newTrace') }}
      </button>
    </header>

    <!-- Filters -->
    <div class="filters">
      <button 
        class="filter-btn" 
        :class="{ active: filterStatus === '' }"
        @click="setFilter('')"
      >
        {{ t('trace.list.all') }}
      </button>
      <button 
        v-for="(config, status) in statusConfig" 
        :key="status"
        class="filter-btn"
        :class="{ active: filterStatus === status }"
        :style="{ '--status-color': config.color }"
        @click="setFilter(status)"
      >
        {{ config.label }}
      </button>
    </div>

    <!-- Trace List -->
    <DataState 
      :loading="loading" 
      :error="error"
      :empty="!loading && !error && filteredTraces.length === 0"
      :empty-message="t('trace.list.empty')"
    >
      <template #empty-actions>
        <button class="btn btn--primary" @click="goToNew">{{ t('trace.list.createFirst') }}</button>
      </template>

      <div v-if="filteredTraces.length > 0" class="traces-list">
        <div 
          v-for="trace in filteredTraces" 
          :key="trace.id" 
          class="trace-card"
          @click="goToDetail(trace.id)"
        >
          <div class="trace-card__header">
            <div class="trace-card__title-row">
              <h3 class="trace-card__title">{{ trace.taskGoal }}</h3>
              <div class="trace-card__badges">
                <span 
                  class="status-badge" 
                  :style="{ color: getStatusStyle(trace.userConfirmationStatus).color, background: getStatusStyle(trace.userConfirmationStatus).bg }"
                >
                  {{ getStatusStyle(trace.userConfirmationStatus).label }}
                </span>
                <span 
                  class="risk-badge" 
                  :style="{ color: getRiskStyle(trace.riskLevel).color }"
                >
                  {{ trace.riskLevel || 'R1' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="trace-card__meta">
            <span class="meta-item">
              <span class="meta-label">ID:</span>
              <span class="meta-value">{{ trace.id }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">创建:</span>
              <span class="meta-value">{{ formatDate(trace.createdAt) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">更新:</span>
              <span class="meta-value">{{ formatDate(trace.updatedAt) }}</span>
            </span>
          </div>

          <div class="trace-card__actions">
            <button 
              v-if="trace.userConfirmationStatus === 'draft' || trace.userConfirmationStatus === 'pending'"
              class="btn btn--sm btn--primary"
              @click.stop="goToConfirm(trace.id)"
            >
              {{ t('trace.confirm.title') }}
            </button>
            <button 
              class="btn btn--sm btn--ghost btn--danger"
              @click.stop="deleteTrace(trace.id, $event)"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          ← {{ t('trace.list.prev') }}
        </button>
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          {{ t('trace.list.next') }} →
        </button>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.traces-page {
  max-width: var(--container-md);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.page-desc {
  color: var(--color-text-secondary);
}

/* Filters */
.filters {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background: var(--status-color, var(--color-primary));
  border-color: var(--status-color, var(--color-primary));
  color: white;
}

/* Trace List */
.traces-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.trace-card {
  padding: var(--space-4);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.trace-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.trace-card__header {
  margin-bottom: var(--space-3);
}

.trace-card__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.trace-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.trace-card__badges {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.risk-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 700;
  background: var(--color-bg-secondary);
}

.trace-card__meta {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.meta-item {
  display: flex;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
}

.meta-label {
  color: var(--color-text-muted);
}

.meta-value {
  color: var(--color-text-secondary);
}

.trace-card__actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.pagination-btn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Buttons */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover {
  background: var(--color-bg-secondary);
}

.btn--danger {
  color: var(--color-error);
}

.btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
