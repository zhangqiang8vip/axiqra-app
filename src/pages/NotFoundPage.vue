<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="not-found">
    <div class="container not-found-inner">
      <p class="eyebrow">404</p>
      <h1>{{ t('notFound.title') }}</h1>
      <p>{{ t('notFound.subtitle') }}</p>
      <RouterLink to="/" class="home-link">{{ t('common.backHome') }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  min-height: calc(100vh - var(--header-height) - 56px);
  display: grid;
  place-items: center;
  padding: var(--space-10) var(--space-6);
}

.not-found-inner {
  max-width: 560px;
  text-align: center;
}

.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 800;
}

h1 {
  margin-bottom: var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

p {
  color: var(--color-text-secondary);
}

.home-link {
  display: inline-flex;
  margin-top: var(--space-6);
  padding: var(--space-3) var(--space-5);
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  font-weight: 700;
}
</style>
