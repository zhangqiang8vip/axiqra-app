<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  nickname: '',
})
const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() => {
  return (
    form.value.username.trim() &&
    form.value.email.trim() &&
    form.value.password.trim() &&
    form.value.password.length >= 6
  )
})

const passwordStrength = computed(() => {
  const pwd = form.value.password
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(4, score)
})

const strengthLabel = computed(() => {
  const labels = [
    t('auth.strengthVeryWeak'),
    t('auth.strengthWeak'),
    t('auth.strengthFair'),
    t('auth.strengthStrong'),
    t('auth.strengthVeryStrong'),
  ]
  return labels[passwordStrength.value]
})

const strengthClass = computed(() => {
  const classes = ['very-weak', 'weak', 'fair', 'strong', 'very-strong']
  return classes[passwordStrength.value]
})

async function handleRegister() {
  if (!isValid.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await apiClient.post('/auth/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      nickname: form.value.nickname || form.value.username,
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

      router.push('/')
    } else {
      errorMsg.value = res.data.message || t('auth.registerFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || t('auth.registerFailed')
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
          <h1 class="title">{{ t('auth.registerTitle') }}</h1>
          <p class="subtitle">{{ t('auth.registerSubtitle') }}</p>

          <form class="form" @submit.prevent="handleRegister">
            <div class="input-group">
              <label for="username" class="input-label">{{ t('auth.username') }} *</label>
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
              <label for="email" class="input-label">{{ t('auth.email') }} *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="input"
                :placeholder="t('auth.emailPlaceholder')"
                autocomplete="email"
              >
            </div>

            <div class="input-group">
              <label for="nickname" class="input-label">{{ t('auth.nickname') }}</label>
              <input
                id="nickname"
                v-model="form.nickname"
                type="text"
                class="input"
                :placeholder="t('auth.nicknamePlaceholder')"
                autocomplete="nickname"
              >
            </div>

            <div class="input-group">
              <label for="password" class="input-label">{{ t('auth.password') }} *</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="input"
                :placeholder="t('auth.passwordPlaceholder')"
                autocomplete="new-password"
              >
              <div class="password-strength" v-if="form.password">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="strengthClass"
                    :style="{ width: `${(passwordStrength / 4) * 100}%` }"
                  ></div>
                </div>
                <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
              </div>
            </div>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <button type="submit" class="btn" :disabled="!isValid || loading">
              {{ loading ? t('auth.registering') : t('auth.registerBtn') }}
            </button>
          </form>

          <p class="switch-link">
            {{ t('auth.hasAccount') }}
            <router-link to="/login">{{ t('auth.loginNow') }}</router-link>
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
  max-width: 420px;
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
  margin-bottom: var(--space-6);
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

.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all var(--transition-base);
}

.strength-fill.very-weak { background: var(--color-error); }
.strength-fill.weak { background: var(--color-warning); }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.strong { background: var(--color-success); }
.strength-fill.very-strong { background: var(--color-success); }

.strength-label {
  font-size: var(--text-xs);
  font-weight: 500;
}

.strength-label.very-weak { color: var(--color-error); }
.strength-label.weak { color: var(--color-warning); }
.strength-label.fair { color: #f59e0b; }
.strength-label.strong { color: var(--color-success); }
.strength-label.very-strong { color: var(--color-success); }

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
