<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'
import { Pagination } from '@/components'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const cases = ref<Array<Record<string, unknown>>>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

async function loadCases() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/public-cases', {
      params: { page: page.value, pageSize: pageSize.value }
    })
    if (res.data?.code === 0) {
      cases.value = res.data.data?.list || res.data.data || []
      total.value = res.data.data?.total || cases.value.length
    } else {
      error.value = res.data?.message || t('publicCases.unavailable')
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('publicCases.unavailable')
  } finally {
    loading.value = false
  }
}

function onPageChange(newPage: number) {
  page.value = newPage
  loadCases()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToDetail(id: number) {
  router.push({ name: 'public-case-detail', params: { id } })
}

function getStatusClass(status: string) {
  const statusMap: Record<string, string> = {
    published: 'status--published',
    draft: 'status--draft',
    archived: 'status--archived',
    pending_review: 'status--pending',
  }
  return statusMap[status || 'published'] || 'status--published'
}

function getRiskClass(riskLevel: string) {
  return `risk--${riskLevel || 'safe'}`
}

onMounted(loadCases)
</script>

<template>
  <div class="public-cases-page">
    <header class="page-header">
      <p class="eyebrow">{{ t('nav.publicCases') }}</p>
      <h1 class="page-title">{{ t('publicCases.title') }}</h1>
      <p class="page-desc">{{ t('publicCases.subtitle') }}</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>
    
    <div v-else-if="cases.length" class="cases-grid">
      <article v-for="item in cases" :key="String(item.id || item.title)" class="case-card" @click="goToDetail(item.id as number)">
        <div class="card-header">
          <span :class="['status-badge', getStatusClass(item.status as string)]">{{ item.status || 'public' }}</span>
        </div>
        <h2 class="card-title">{{ item.title || item.taskGoal || t('publicCases.caseFallback') }}</h2>
        <p class="card-summary">{{ item.summary || item.description || item.outcome || '-' }}</p>
        <div class="card-tags" v-if="item.techStack || item.riskLevel">
          <span v-if="item.techStack" class="tag">{{ item.techStack }}</span>
          <span v-if="item.riskLevel" :class="['risk-badge', getRiskClass(item.riskLevel as string)]">{{ item.riskLevel }}</span>
        </div>
      </article>
    </div>
    
    <div v-else class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <strong>{{ error || t('publicCases.empty') }}</strong>
    </div>

    <Pagination
      v-if="totalPages > 1"
      :current="page"
      :total="totalPages"
      @change="onPageChange"
      class="pagination"
    />
  </div>
</template>

<style scoped>
.public-cases-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin: 0 0 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.page-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.case-card {
  padding: 24px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.case-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 12px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.status--published {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status--draft {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.status--archived {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.status--pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-summary {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: 6px;
}

.risk-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.risk--safe {
  background: var(--color-success-light);
  color: var(--color-success);
}

.risk--low {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.risk--medium {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.risk--high {
  background: var(--color-error-light);
  color: var(--color-error);
}

.risk--critical {
  background: var(--color-error);
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px;
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state strong {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .cases-grid {
    grid-template-columns: 1fr;
  }
}
</style>
