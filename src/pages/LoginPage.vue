<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})
const loading = ref(false)
const errorMsg = ref('')

const redirectPath = computed(() => route.query.redirect as string || '/')
const isDeviceAuthRedirect = computed(() => redirectPath.value.startsWith('/auth/device'))
const redirectLabel = computed(() => {
  if (isDeviceAuthRedirect.value) return t('auth.redirectDevice')
  if (redirectPath.value === '/') return t('auth.redirectHome')
  return t('auth.redirectPath', { path: redirectPath.value })
})

const isValid = computed(() => {
  return form.value.username.trim() && form.value.password.trim()
})

async function handleLogin() {
  if (!isValid.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await apiClient.post('/auth/login', {
      username: form.value.username,
      password: form.value.password,
    })

    const { code, data } = res.data
    if (code === 0 && data?.token) {
      authStore.setToken(data.token)
      authStore.setUser({
        id: data.userId || data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        scopes: data.scopes || [],
        workspaces: data.workspaces || [],
      })

      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } else {
      errorMsg.value = res.data.message || t('auth.loginFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || t('auth.loginFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card">
        <!-- Header -->
        <div class="card-header">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="var(--color-primary)" />
              <path d="M8 20L14 8L20 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 16H18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span class="logo-text">Axiqra</span>
          </div>
        </div>

        <!-- Body -->
        <div class="card-body">
          <h1 class="title">{{ t('auth.loginTitle') }}</h1>
          <p class="subtitle">{{ redirectLabel }}</p>

          <div v-if="isDeviceAuthRedirect" class="login-context">
            <div class="context-status">{{ t('auth.agentAuthStatus') }}</div>
            <div class="context-copy">
              {{ t('auth.agentAuthCopy') }}
              <code>node scripts/auth.js --wait &lt;device_code&gt;</code>
            </div>
          </div>
          <div v-else class="login-context">
            <div class="context-status">{{ t('auth.demoStatus') }}</div>
            <div class="context-copy">
              {{ t('auth.demoCopy') }}
            </div>
          </div>

          <form class="form" @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="username" class="input-label">{{ t('auth.username') }}</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="input"
                :placeholder="t('auth.usernamePlaceholder')"
                autocomplete="username"
              >
            </div>

            <div class="input-group">
              <label for="password" class="input-label">{{ t('auth.password') }}</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="input"
                :placeholder="t('auth.passwordPlaceholder')"
                autocomplete="current-password"
              >
            </div>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <button type="submit" class="btn" :disabled="!isValid || loading">
              {{ loading ? t('auth.loggingIn') : t('auth.loginBtn') }}
            </button>
          </form>

          <p class="switch-link">
            {{ t('auth.noAccount') }}
            <router-link to="/register">{{ t('auth.registerNow') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--header-height) - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
}

.container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: var(--color-bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.card-header {
  display: flex;
  justify-content: center;
  padding: var(--space-6) var(--space-6) 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.card-body {
  padding: var(--space-6);
}

.title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--space-2);
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--space-4);
}

.login-context {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.context-status {
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.context-copy {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.context-copy code {
  display: block;
  margin-top: var(--space-2);
  padding: var(--space-2);
  color: var(--color-text-primary);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  overflow-wrap: anywhere;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  outline: none;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: center;
}

.btn {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-glow);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-link {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.switch-link a {
  color: var(--color-primary);
  font-weight: 500;
}

.switch-link a:hover {
  text-decoration: underline;
}
</style>
