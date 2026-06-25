<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'

const { t } = useI18n()
const loading = ref(true)
const error = ref('')
const cases = ref<Array<Record<string, unknown>>>([])

async function loadCases() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/public-cases')
    if (res.data?.code === 0) {
      cases.value = res.data.data || []
    } else {
      error.value = res.data?.message || t('publicCases.unavailable')
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('publicCases.unavailable')
  } finally {
    loading.value = false
  }
}

onMounted(loadCases)
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <header class="page-header">
        <p class="eyebrow">{{ t('nav.publicCases') }}</p>
        <h1>{{ t('publicCases.title') }}</h1>
        <p>{{ t('publicCases.subtitle') }}</p>
      </header>

      <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="cases.length" class="grid">
        <article v-for="item in cases" :key="String(item.id || item.title)" class="panel">
          <span>{{ t('publicCases.status') }}: {{ item.status || 'public' }}</span>
          <h2>{{ item.title || item.taskGoal || t('publicCases.caseFallback') }}</h2>
          <p>{{ item.summary || item.description || item.outcome || '-' }}</p>
        </article>
      </div>
      <div v-else class="empty">
        <strong>{{ error || t('publicCases.empty') }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  min-height: calc(100vh - var(--header-height) - 56px);
  padding: var(--space-10) var(--space-6);
}

.page-inner,
.grid {
  display: grid;
  gap: var(--space-4);
}

.page-header h1 {
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

.page-header p:last-child,
.panel p,
.panel span {
  color: var(--color-text-secondary);
}

.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.panel,
.empty {
  padding: var(--space-5);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.panel h2 {
  margin: var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}

.panel span {
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.empty {
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
