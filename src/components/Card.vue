<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="card">
    <header v-if="title || $slots.header" class="card__header">
      <div class="card__header-left">
        <slot name="header">
          <h3 v-if="title" class="card__title">{{ title }}</h3>
          <p v-if="description" class="card__description">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots['header-actions']" class="card__header-right">
        <slot name="header-actions"></slot>
      </div>
    </header>

    <div class="card__body">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.card__header-left {
  flex: 1;
}

.card__header-right {
  flex-shrink: 0;
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.card__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.card__body {
  padding: var(--space-4);
}

.card__footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}
</style>
