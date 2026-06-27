<script setup lang="ts">
import { computed } from 'vue'
import type { RiskLevel } from '@/types'

const props = defineProps<{
  level: RiskLevel | string
  size?: 'sm' | 'md' | 'lg'
}>()

const config = computed(() => {
  const levelMap: Record<string, { color: string; bg: string; label: string }> = {
    R0: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: 'R0 - 无风险' },
    R1: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: 'R1 - 低风险' },
    R2: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: 'R2 - 中低风险' },
    R3: { color: 'var(--color-warning)', bg: 'rgba(249, 115, 22, 0.1)', label: 'R3 - 中风险' },
    R4: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', label: 'R4 - 高风险' },
  }
  return levelMap[props.level] || { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: String(props.level) }
})

const sizeClass = computed(() => `badge--${props.size || 'md'}`)
</script>

<template>
  <span class="badge risk-badge" :class="sizeClass" :style="{ color: config.color, backgroundColor: config.bg }">
    {{ config.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  white-space: nowrap;
}

.badge--sm {
  font-size: var(--font-size-xs);
  padding: 0.0625rem 0.375rem;
}

.badge--md {
  font-size: var(--font-size-sm);
}

.badge--lg {
  font-size: var(--font-size-base);
  padding: 0.25rem 0.75rem;
}
</style>
