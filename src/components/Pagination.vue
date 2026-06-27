<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | '...')[] = []
  const total = props.total
  const current = props.current

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)

  return pages
})

function goTo(page: number | '...') {
  if (typeof page === 'number' && page !== props.current) {
    emit('change', page)
  }
}

function prev() {
  if (props.current > 1) {
    emit('change', props.current - 1)
  }
}

function next() {
  if (props.current < props.total) {
    emit('change', props.current + 1)
  }
}
</script>

<template>
  <nav class="pagination" aria-label="分页">
    <button
      class="page-btn page-btn--nav"
      :disabled="current === 1"
      @click="prev"
      aria-label="上一页"
    >
      ‹
    </button>

    <button
      v-for="(p, idx) in visiblePages"
      :key="`${p}-${idx}`"
      :class="['page-btn', { 'page-btn--active': p === current, 'page-btn--ellipsis': p === '...' }]"
      :disabled="p === '...'"
      @click="goTo(p)"
    >
      {{ p }}
    </button>

    <button
      class="page-btn page-btn--nav"
      :disabled="current === total"
      @click="next"
      aria-label="下一页"
    >
      ›
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.page-btn--ellipsis {
  border: none;
  background: transparent;
  cursor: default;
}

.page-btn--nav {
  font-size: var(--font-size-lg);
  font-weight: 600;
}
</style>
