<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi } from '@/api'
import { SearchResultCard, DataState } from '@/components'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchMeta = ref<{
  totalHits: number
  returnedHits: number
  vectorSearchEnabled?: boolean
  candidateSeedCreated?: boolean
} | null>(null)

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const data = await searchApi.search({
      query: query.value.trim(),
      workspaceId: authStore.currentWorkspaceId || undefined,
      limit: 20
    })
    results.value = data.records || data.list || []
    searchMeta.value = {
      totalHits: data.total || 0,
      returnedHits: results.value.length,
      vectorSearchEnabled: data.vectorSearchEnabled,
      candidateSeedCreated: data.candidateSeedCreated
    }
  } catch (err: any) {
    error.value = err?.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

function goToCreateSeed() {
  router.push({ name: 'seed-new', query: { q: query.value } })
}
</script>

<template>
  <div class="search-page">
    <div class="search-section">
      <h1 class="search-title">Search</h1>
      <div class="search-box">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="query" 
            type="text" 
            class="search-input" 
            placeholder="Search solutions, traces..."
            @keydown.enter="search" 
          />
          <button v-if="query" class="search-clear" @click="query = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <button class="search-btn" :disabled="loading || !query.trim()" @click="search">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </div>

    <div class="results-section">
      <DataState :loading="loading" :error="error" :empty="!loading && !error && results.length === 0" empty-message="No results found">
        <template #empty-actions>
          <button class="btn-create" @click="goToCreateSeed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Seed
          </button>
        </template>

        <div v-if="results.length > 0" class="results-container">
          <div class="results-header">
            <span class="results-count">
              Found <strong>{{ searchMeta?.totalHits || results.length }}</strong> results
            </span>
            <div class="results-badges">
              <span v-if="searchMeta?.vectorSearchEnabled" class="badge badge-primary">
                Vector Search
              </span>
              <span v-if="searchMeta?.candidateSeedCreated" class="badge badge-success">
                Seed Created
              </span>
            </div>
          </div>
          
          <div class="results-list">
            <SearchResultCard v-for="r in results" :key="`${r.type}-${r.id}`" :result="r" />
          </div>
        </div>
      </DataState>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.search-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 24px;
}

.search-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.search-box {
  display: flex;
  gap: 12px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px;
  font-size: 15px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-bg);
}

.search-clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.search-clear:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.search-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.results-container {
  margin-top: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.results-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.results-count strong {
  color: var(--color-text-primary);
}

.results-badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-full);
}

.badge-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.btn-create:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 640px) {
  .search-page { padding: 16px; }
  .search-box { flex-direction: column; }
  .search-btn { width: 100%; }
}
</style>
