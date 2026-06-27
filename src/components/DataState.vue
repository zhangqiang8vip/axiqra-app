<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
}>()
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="state-container state-container--loading">
    <div class="loading-spinner"></div>
    <p class="state-text">加载中...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="state-container state-container--error">
    <div class="state-icon">⚠️</div>
    <p class="state-text state-text--error">{{ error }}</p>
    <slot name="error-actions">
      <button class="btn btn--secondary" @click="$emit('retry')">重试</button>
    </slot>
  </div>

  <!-- Empty State -->
  <div v-else-if="empty" class="state-container state-container--empty">
    <div class="state-icon">📭</div>
    <p class="state-text">{{ emptyMessage || '暂无数据' }}</p>
    <slot name="empty-actions"></slot>
  </div>

  <!-- Content -->
  <slot v-else></slot>
</template>

<style scoped>
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.state-container--loading {
  min-height: 200px;
}

.state-container--error {
  min-height: 200px;
  color: var(--color-error);
}

.state-container--empty {
  min-height: 200px;
  color: var(--color-text-muted);
}

.state-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.state-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.state-text--error {
  color: var(--color-error);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
