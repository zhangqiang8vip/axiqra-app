<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { useThemeStore } from '@/stores/theme'

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const skillUrl = 'http://127.0.0.1:5173/skills/SKILL.md'
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <header class="page-header">
        <p class="eyebrow">{{ t('settings.appearance') }}</p>
        <h1>{{ t('settings.title') }}</h1>
        <p>{{ t('settings.subtitle') }}</p>
      </header>

      <div class="grid">
        <section class="panel">
          <h2>{{ t('settings.theme') }}</h2>
          <div class="segmented">
            <button :class="{ active: themeStore.theme === 'light' }" @click="themeStore.theme = 'light'">
              {{ t('settings.lightMode') }}
            </button>
            <button :class="{ active: themeStore.theme === 'dark' }" @click="themeStore.theme = 'dark'">
              {{ t('settings.darkMode') }}
            </button>
          </div>
        </section>

        <section class="panel">
          <h2>{{ t('settings.language') }}</h2>
          <div class="segmented">
            <button :class="{ active: locale === 'en' }" @click="setLocale('en')">
              {{ t('settings.english') }}
            </button>
            <button :class="{ active: locale === 'zh' }" @click="setLocale('zh')">
              {{ t('settings.chinese') }}
            </button>
          </div>
        </section>

        <section class="panel wide">
          <h2>{{ t('settings.runtime') }}</h2>
          <dl class="runtime">
            <div>
              <dt>{{ t('settings.apiBase') }}</dt>
              <dd>{{ apiBase }}</dd>
            </div>
            <div>
              <dt>{{ t('settings.skillUrl') }}</dt>
              <dd>{{ skillUrl }}</dd>
            </div>
          </dl>
          <p class="note">{{ t('settings.note') }}</p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  min-height: calc(100vh - var(--header-height) - 56px);
  padding: var(--space-10) var(--space-6);
}

.page-inner,
.grid {
  display: grid;
  gap: var(--space-4);
}

.page-header h1 {
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

.page-header p:last-child,
.note,
dt {
  color: var(--color-text-secondary);
}

.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel {
  padding: var(--space-5);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.wide {
  grid-column: 1 / -1;
}

.panel h2 {
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: var(--space-1);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.segmented button {
  padding: var(--space-3);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  font-weight: 700;
}

.segmented button.active {
  color: var(--color-text-inverse);
  background: var(--color-primary);
}

.runtime {
  display: grid;
  gap: var(--space-3);
}

.runtime div {
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

dt {
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
}

dd {
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}

.note {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
}

@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
