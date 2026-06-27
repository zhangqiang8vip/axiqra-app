<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'solution' | 'public_case' | 'project_case' | 'candidate_seed'
}>()

const config = computed(() => {
  const typeMap = {
    solution: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', icon: '📋', label: 'Solution' },
    public_case: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', icon: '📚', label: 'Public Case' },
    project_case: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', icon: '📁', label: 'Project Case' },
    candidate_seed: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', icon: '🌱', label: 'Seed' },
  }
  return typeMap[props.type] || typeMap.solution
})
</script>

<template>
  <span class="type-badge" :style="{ color: config.color, backgroundColor: config.bg }">
    <span class="type-badge__icon">{{ config.icon }}</span>
    <span class="type-badge__label">{{ config.label }}</span>
  </span>
</template>

<style scoped>
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
}

.type-badge__icon {
  font-size: var(--font-size-sm);
}
</style>
