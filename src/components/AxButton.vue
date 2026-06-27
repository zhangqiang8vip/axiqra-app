<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  icon: false,
})

const classes = computed(() => [
  'ax-btn',
  `ax-btn--${props.variant}`,
  `ax-btn--${props.size}`,
  {
    'ax-btn--loading': props.loading,
    'ax-btn--icon': props.icon,
  },
])
</script>

<template>
  <button :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="ax-btn__spinner"></span>
    <slot />
  </button>
</template>

<style scoped>
.ax-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.ax-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Sizes */
.ax-btn--sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.ax-btn--md {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
}

.ax-btn--lg {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}

/* Icon button */
.ax-btn--icon.ax-btn--sm { padding: 0.5rem; }
.ax-btn--icon.ax-btn--md { padding: 0.625rem; }
.ax-btn--icon.ax-btn--lg { padding: 0.875rem; }

/* Variants */
.ax-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.ax-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.ax-btn--secondary {
  background: var(--color-bg-tertiary, #f1f5f9);
  color: var(--color-text-primary, #0f172a);
  border: 1px solid var(--color-border, #e2e8f0);
}

.ax-btn--secondary:hover:not(:disabled) {
  background: var(--color-border, #e2e8f0);
}

.ax-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary, #475569);
}

.ax-btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-tertiary, #f1f5f9);
  color: var(--color-text-primary, #0f172a);
}

.ax-btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.ax-btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

/* Loading spinner */
.ax-btn--loading {
  pointer-events: none;
}

.ax-btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ax-spin 0.6s linear infinite;
}

@keyframes ax-spin {
  to { transform: rotate(360deg); }
}
</style>
