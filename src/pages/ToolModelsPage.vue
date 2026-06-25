<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'

const { t } = useI18n()
const loading = ref(true)
const error = ref('')
const models = ref<Array<Record<string, unknown>>>([])

async function loadModels() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/v1/tool-models/leaderboard')
    if (res.data?.code === 0) {
      models.value = res.data.data || []
    } else {
      error.value = res.data?.message || t('toolModels.unavailable')
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('toolModels.unavailable')
  } finally {
    loading.value = false
  }
}

onMounted(loadModels)
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <header class="page-header">
        <p class="eyebrow">{{ t('nav.leaderboard') }}</p>
        <h1>{{ t('toolModels.title') }}</h1>
        <p>{{ t('toolModels.subtitle') }}</p>
      </header>

      <div class="table-panel">
        <div class="table-head">
          <span>{{ t('toolModels.model') }}</span>
          <span>{{ t('toolModels.score') }}</span>
          <span>{{ t('toolModels.runs') }}</span>
        </div>
        <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
        <div v-else-if="models.length" class="rows">
          <article v-for="item in models" :key="String(item.id || item.modelName || item.name)" class="row">
            <strong>{{ item.modelName || item.name || t('toolModels.model') }}</strong>
            <span>{{ item.score || item.rankScore || '-' }}</span>
            <span>{{ item.runs || item.runCount || '-' }}</span>
          </article>
        </div>
        <div v-else class="empty">{{ error || t('toolModels.empty') }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  min-height: calc(100vh - var(--header-height) - 56px);
  padding: var(--space-10) var(--space-6);
}

.page-inner {
  display: grid;
  gap: var(--space-4);
}

.page-header h1 {
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

.page-header p:last-child,
.table-head,
.row span,
.empty {
  color: var(--color-text-secondary);
}

.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.table-panel {
  overflow: hidden;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.table-head,
.row {
  display: grid;
  grid-template-columns: 1fr 120px 120px;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4);
}

.table-head {
  background: var(--color-bg-secondary);
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.row + .row {
  border-top: 1px solid var(--color-border);
}

.row strong {
  color: var(--color-text-primary);
}

.empty {
  padding: var(--space-8);
  text-align: center;
}

@media (max-width: 640px) {
  .table-head,
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
