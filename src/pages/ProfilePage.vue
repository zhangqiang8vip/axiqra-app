<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const tokenState = computed(() => authStore.token ? t('profile.tokenActive') : t('profile.tokenMissing'))
const workspaces = computed(() => authStore.user?.workspaces || [])
const scopes = computed(() => authStore.user?.scopes || [])
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('profile.account') }}</p>
          <h1>{{ t('profile.title') }}</h1>
          <p>{{ t('profile.subtitle') }}</p>
        </div>
      </header>

      <div class="grid">
        <section class="panel">
          <h2>{{ t('profile.account') }}</h2>
          <dl class="details">
            <div>
              <dt>{{ t('profile.username') }}</dt>
              <dd>{{ authStore.user?.username || '-' }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.email') }}</dt>
              <dd>{{ authStore.user?.email || '-' }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.userId') }}</dt>
              <dd>{{ authStore.user?.id || '-' }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.token') }}</dt>
              <dd>{{ tokenState }}</dd>
            </div>
          </dl>
        </section>

        <section class="panel">
          <h2>{{ t('profile.actions') }}</h2>
          <div class="actions">
            <RouterLink to="/dashboard" class="primary-link">{{ t('profile.openDashboard') }}</RouterLink>
            <RouterLink to="/settings" class="secondary-link">{{ t('profile.openSettings') }}</RouterLink>
          </div>
        </section>

        <section class="panel">
          <h2>{{ t('profile.workspaces') }}</h2>
          <div v-if="workspaces.length" class="list">
            <article v-for="workspace in workspaces" :key="workspace.id" class="list-row">
              <strong>{{ workspace.workspaceName }}</strong>
              <span>{{ workspace.workspaceType }}</span>
            </article>
          </div>
          <div v-else class="empty">{{ t('profile.noWorkspaces') }}</div>
        </section>

        <section class="panel">
          <h2>{{ t('profile.scopes') }}</h2>
          <div v-if="scopes.length" class="chips">
            <span v-for="scope in scopes" :key="scope">{{ scope }}</span>
          </div>
          <div v-else class="empty">{{ t('profile.noScopes') }}</div>
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
.grid,
.details,
.list,
.actions {
  display: grid;
  gap: var(--space-4);
}

.page-header h1 {
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-3xl);
}

.page-header p:last-child {
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

.panel h2 {
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}

.details div,
.list-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

dt,
.list-row span,
.empty {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

dd,
.list-row strong {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.primary-link,
.secondary-link {
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  text-align: center;
  font-weight: 700;
}

.primary-link {
  color: var(--color-text-inverse);
  background: var(--color-primary);
}

.secondary-link {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chips span {
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}

.empty {
  padding: var(--space-8);
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

@media (max-width: 860px) {
  .grid,
  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
