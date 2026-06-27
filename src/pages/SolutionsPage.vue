<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { solutionApi } from '@/api'
import { DataState, Pagination } from '@/components'

const { t } = useI18n()
const router = useRouter()

const solutions = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const statusFilter = ref('')
const techStackFilter = ref('')
const riskLevelFilter = ref('')

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const techStackOptions = [
  { value: '', label: 'All Tech Stack' },
  { value: 'Java', label: 'Java' },
  { value: 'Python', label: 'Python' },
  { value: 'Go', label: 'Go' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Rust', label: 'Rust' },
  { value: 'C++', label: 'C++' },
]

const riskLevelOptions = [
  { value: '', label: 'All Risk Levels' },
  { value: 'safe', label: 'Safe' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

async function load() {
  loading.value = true
  try {
    const data = await solutionApi.list({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined,
      techStack: techStackFilter.value || undefined,
      riskLevel: riskLevelFilter.value || undefined,
    })
    solutions.value = data.list
    total.value = data.total
  } catch (err: any) {
    error.value = err?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  page.value = 1
  load()
}

function onPageChange(newPage: number) {
  page.value = newPage
  load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToDetail(id: number) {
  router.push({ name: 'solution-detail', params: { id } })
}

onMounted(load)
</script>

<template>
  <div class="solutions-page">
    <header class="page-header">
      <h1 class="page-title">{{ t('solutions.title') }}</h1>
      <p class="page-desc">{{ t('solutions.description') }}</p>
    </header>

    <div class="filters">
      <select v-model="statusFilter" @change="onFilterChange" class="filter-select">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <select v-model="techStackFilter" @change="onFilterChange" class="filter-select">
        <option v-for="opt in techStackOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <select v-model="riskLevelFilter" @change="onFilterChange" class="filter-select">
        <option v-for="opt in riskLevelOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <DataState :loading="loading" :error="error" :empty="!loading && !error && solutions.length === 0" :empty-message="t('solutions.empty')">
      <div class="solutions-grid">
        <article v-for="s in solutions" :key="s.id" class="solution-card" @click="goToDetail(s.id)">
          <div class="card-header">
            <span class="card-badge" :class="`badge--${s.status}`">{{ s.status }}</span>
            <span class="card-badge badge-risk" :class="`risk--${s.riskLevel}`">{{ s.riskLevel }}</span>
          </div>
          <h3 class="card-title">{{ s.title }}</h3>
          <p class="card-summary">{{ s.summary || s.applicableScenario || '-' }}</p>
          <div class="card-meta">
            <span v-if="s.techStack" class="meta-tag">{{ s.techStack }}</span>
            <span v-if="s.verificationLevel" class="meta-tag">Level: {{ s.verificationLevel }}</span>
          </div>
        </article>
      </div>

      <Pagination
        v-if="totalPages > 1"
        :current="page"
        :total="totalPages"
        @change="onPageChange"
        class="pagination"
      />
    </DataState>
  </div>
</template>

<style scoped>
.solutions-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
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

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 140px;
}

.filter-select:hover {
  border-color: var(--color-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.solutions-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.solution-card {
  padding: 20px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.solution-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.card-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge--draft {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.badge--pending_review {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge--published {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge--archived {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
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

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.card-summary {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 12px;
  color: var(--color-text-tertiary);
  padding: 4px 10px;
  background: var(--color-bg-secondary);
  border-radius: 6px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>
