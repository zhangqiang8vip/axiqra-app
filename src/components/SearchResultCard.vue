<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResult } from '@/types'
import RiskBadge from './RiskBadge.vue'
import VerificationBadge from './VerificationBadge.vue'
import ResultTypeBadge from './ResultTypeBadge.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  result: SearchResult
}>()

const router = useRouter()

const typeRoute = computed(() => {
  const routeMap = {
    solution: '/solutions',
    public_case: '/public-cases',
    project_case: '/project-cases',
    candidate_seed: '/candidate-seeds',
  }
  return routeMap[props.result.type] || '/'
})

const detailRoute = computed(() => `${typeRoute.value}/${props.result.id}`)

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleClick = () => {
  router.push(detailRoute.value)
}
</script>

<template>
  <article class="search-result-card" @click="handleClick">
    <header class="search-result-card__header">
      <ResultTypeBadge :type="result.type" />
      <span class="search-result-card__date">{{ formatDate(result.updatedAt) }}</span>
    </header>

    <h3 class="search-result-card__title">{{ result.title }}</h3>

    <p class="search-result-card__summary">{{ result.summary }}</p>

    <div class="search-result-card__meta">
      <span v-if="result.techStack" class="search-result-card__tag">{{ result.techStack }}</span>
      <RiskBadge v-if="result.riskLevel" :level="result.riskLevel" size="sm" />
      <VerificationBadge v-if="result.verificationLevel" :level="result.verificationLevel" size="sm" />
    </div>

    <footer v-if="result.fitReason" class="search-result-card__footer">
      <span class="search-result-card__fit-reason">{{ result.fitReason }}</span>
    </footer>

    <div v-if="result.invocationCount !== undefined" class="search-result-card__stats">
      <span>调用 {{ result.invocationCount }} 次</span>
      <span v-if="result.sampleSize && result.sampleSize >= 5">
        成功率 {{ result.successRate !== undefined ? `${(result.successRate * 100).toFixed(0)}%` : 'N/A' }}
      </span>
      <span v-else-if="result.sampleSize !== undefined">样本数 {{ result.sampleSize }}</span>
    </div>
  </article>
</template>

<style scoped>
.search-result-card {
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-result-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.search-result-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.search-result-card__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.search-result-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.search-result-card__summary {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.search-result-card__tag {
  padding: 0.125rem 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.search-result-card__footer {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.search-result-card__fit-reason {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.search-result-card__stats {
  display: flex;
  gap: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
