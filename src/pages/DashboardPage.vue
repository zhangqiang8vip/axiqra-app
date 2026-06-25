<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(true)
const traceError = ref('')
const seedError = ref('')
const traces = ref<Array<Record<string, unknown>>>([])
const seeds = ref<Array<Record<string, unknown>>>([])

const workspace = computed(() => authStore.user?.workspaces?.[0] || null)

async function loadDashboard() {
  loading.value = true
  traceError.value = ''
  seedError.value = ''

  const [traceResult, seedResult] = await Promise.allSettled([
    apiClient.get('/traces'),
    apiClient.get('/seeds'),
  ])

  if (traceResult.status === 'fulfilled' && traceResult.value.data?.code === 0) {
    traces.value = traceResult.value.data.data || []
  } else {
    traceError.value = t('dashboard.traceUnavailable')
  }

  if (seedResult.status === 'fulfilled' && seedResult.value.data?.code === 0) {
    seeds.value = seedResult.value.data.data || []
  } else {
    seedError.value = t('dashboard.seedUnavailable')
  }

  loading.value = false
}

onMounted(loadDashboard)
</script>

<template>
  <section class="dashboard">
    <div class="container dashboard-inner">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">{{ t('dashboard.workspace') }}</p>
          <h1>{{ workspace?.name || t('dashboard.workspaceFallback') }}</h1>
        </div>
        <button class="refresh-btn" :disabled="loading" @click="loadDashboard">
          {{ t('common.refresh') }}
        </button>
      </header>

      <div class="summary-grid">
        <div class="summary-tile">
          <span>{{ t('dashboard.user') }}</span>
          <strong>{{ authStore.user?.username || t('dashboard.signedIn') }}</strong>
        </div>
        <div class="summary-tile">
          <span>{{ t('dashboard.workspace') }}</span>
          <strong>{{ workspace?.id || t('dashboard.defaultWorkspace') }}</strong>
        </div>
        <div class="summary-tile">
          <span>{{ t('dashboard.recentTraces') }}</span>
          <strong>{{ traces.length }}</strong>
        </div>
        <div class="summary-tile">
          <span>{{ t('dashboard.seeds') }}</span>
          <strong>{{ seeds.length }}</strong>
        </div>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel-head">
            <h2>{{ t('dashboard.recentTrace') }}</h2>
            <span>{{ traceError || t('common.liveApi') }}</span>
          </div>
          <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
          <div v-else-if="traces.length" class="list">
            <article v-for="trace in traces.slice(0, 5)" :key="String(trace.id)" class="list-row">
              <strong>{{ trace.taskGoal || trace.outcome || t('dashboard.traceFallback') }}</strong>
              <span>{{ trace.riskLevel || t('dashboard.riskNA') }}</span>
            </article>
          </div>
          <div v-else class="empty">{{ t('dashboard.noTrace') }}</div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>{{ t('dashboard.seedStatus') }}</h2>
            <span>{{ seedError || t('common.liveApi') }}</span>
          </div>
          <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
          <div v-else-if="seeds.length" class="list">
            <article v-for="seed in seeds.slice(0, 5)" :key="String(seed.id)" class="list-row">
              <strong>{{ seed.taskGoal || seed.query || t('dashboard.seedFallback') }}</strong>
              <span>{{ seed.status || t('dashboard.pending') }}</span>
            </article>
          </div>
          <div v-else class="empty">{{ t('dashboard.noSeed') }}</div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  min-height: calc(100vh - var(--header-height) - 56px);
  padding: var(--space-10) var(--space-6);
}

.dashboard-inner {
  display: grid;
  gap: var(--space-6);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.dashboard h1 {
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

.refresh-btn {
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  font-weight: 600;
}

.refresh-btn:disabled {
  opacity: 0.6;
}

.summary-grid,
.panel-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.panel-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-tile,
.panel {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.summary-tile {
  padding: var(--space-4);
}

.summary-tile span,
.panel-head span,
.list-row span,
.empty {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.summary-tile strong {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-xl);
}

.panel {
  padding: var(--space-5);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.panel h2 {
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}

.list {
  display: grid;
  gap: var(--space-3);
}

.list-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.list-row strong {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  padding: var(--space-8);
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

@media (max-width: 860px) {
  .summary-grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
