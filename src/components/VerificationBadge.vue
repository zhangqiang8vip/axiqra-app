<script setup lang="ts">
import { computed } from 'vue'
import type { VerificationLevel } from '@/types'

const props = defineProps<{
  level: VerificationLevel | string
  size?: 'sm' | 'md' | 'lg'
}>()

const config = computed(() => {
  const levelMap: Record<string, { color: string; bg: string; label: string }> = {
    L0: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: 'L0 - 无验证' },
    L1: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', label: 'L1 - 本地验证' },
    L2: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.15)', label: 'L2 - 测试环境' },
    L3: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: 'L3 - 预发布' },
    L4: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.15)', label: 'L4 - 生产监控' },
    L5: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.2)', label: 'L5 - 多环境' },
  }
  return levelMap[props.level] || { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: String(props.level) }
})

const sizeClass = computed(() => `badge--${props.size || 'md'}`)
</script>

<template>
  <span class="badge verification-badge" :class="sizeClass" :style="{ color: config.color, backgroundColor: config.bg }">
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
