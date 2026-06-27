<script setup lang="ts">
defineProps<{
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

defineExpose({
  close: () => emit('close'),
})
</script>

<template>
  <div class="toast" :class="`toast--${type || 'info'}`" role="alert">
    <span class="toast__icon">
      {{ type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ' }}
    </span>
    <span class="toast__message">{{ message }}</span>
    <button class="toast__close" @click="emit('close')">✕</button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast--success {
  background: var(--color-success);
  color: white;
}

.toast--error {
  background: var(--color-error);
  color: white;
}

.toast--warning {
  background: var(--color-warning);
  color: black;
}

.toast--info {
  background: var(--color-primary);
  color: white;
}

.toast__icon {
  font-size: var(--font-size-lg);
}

.toast__message {
  flex: 1;
  font-size: var(--font-size-sm);
}

.toast__close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-sm);
}

.toast__close:hover {
  opacity: 1;
}
</style>
