<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'

const { t } = useI18n()
const route = useRoute()

const code = ref(route.query.code as string || '')
const device = ref(route.query.device as string || '')
const userCode = ref(code.value)
const verified = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const hasDeviceParams = computed(() => Boolean(code.value && device.value))

function formatInput(e: Event) {
  const input = e.target as HTMLInputElement
  input.value = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  userCode.value = input.value
}

async function handleVerify() {
  if (!userCode.value) {
    errorMsg.value = t('auth.verifyInputRequired')
    return
  }

  if (!device.value) {
    errorMsg.value = t('auth.verifyFailed')
    return
  }

  if (userCode.value.toUpperCase() !== code.value.toUpperCase()) {
    errorMsg.value = t('auth.codeMismatch')
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await apiClient.post('/auth/device/confirm', {
        user_code: code.value,
        device_code: device.value
      })

    const data = res.data

    if (data.code === 0) {
      verified.value = true
    } else {
      errorMsg.value = data.message || t('auth.verifyFailed')
    }
  } catch {
    errorMsg.value = t('auth.networkError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="verify-page">
    <div class="container">
      <div class="verify-card">
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

        <!-- Title -->
        <div class="card-body">
          <h1 class="title">{{ t('auth.title') }}</h1>
          <p class="subtitle">
            {{ hasDeviceParams ? t('auth.confirmSubtitle') : t('auth.startSubtitle') }}
          </p>

          <div v-if="!hasDeviceParams" class="missing-state">
            <div class="missing-title">{{ t('auth.missingTitle') }}</div>
            <p>{{ t('auth.missingDesc') }}</p>
            <code>node scripts/auth.js --start</code>
          </div>

          <!-- Code Display -->
          <div v-if="hasDeviceParams && !verified" class="code-display">
            <span class="code-label">{{ t('auth.codeLabel') }}</span>
            <span class="code-value">{{ code || '---' }}</span>
          </div>

          <div v-if="hasDeviceParams && !verified" class="device-summary">
            <span>{{ t('auth.deviceCode') }}</span>
            <code>{{ device }}</code>
          </div>

          <!-- Form -->
          <form v-if="hasDeviceParams && !verified" class="form" @submit.prevent="handleVerify">
            <div class="input-group">
              <label for="codeInput" class="input-label">{{ t('auth.inputLabel') }}</label>
              <input
                id="codeInput"
                type="text"
                class="input"
                :placeholder="t('auth.placeholder')"
                :value="userCode"
                maxlength="9"
                autocomplete="off"
                spellcheck="false"
                @input="formatInput"
              >
            </div>

            <button type="submit" class="btn" :class="{ loading }" :disabled="loading">
              {{ loading ? t('auth.verifying') : t('auth.verifyBtn') }}
            </button>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
          </form>

          <!-- Success -->
          <div v-if="verified" class="success">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 class="success-title">{{ t('auth.successTitle') }}</h2>
            <p class="success-desc">
              {{ t('auth.successDesc') }}。{{ t('auth.continueRun') }}
              <code>node scripts/auth.js --wait {{ device }}</code>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <p class="expire-note">{{ t('auth.expireNote') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
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

.verify-card {
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
  text-align: center;
}

.title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-info));
  border-radius: var(--radius-2xl);
  margin-bottom: var(--space-6);
}

.device-summary,
.missing-state {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: left;
}

.device-summary span,
.missing-title {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 700;
}

.device-summary code,
.missing-state code,
.success-desc code {
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

.missing-state p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.code-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.code-value {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: white;
  letter-spacing: 0.1em;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-group {
  text-align: left;
}

.input-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-lg);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-align: center;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
  outline: none;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.input::placeholder {
  color: var(--color-text-tertiary);
  letter-spacing: 0;
  text-transform: none;
  font-size: var(--text-base);
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

.btn.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: center;
}

.success {
  padding: var(--space-6) 0;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  background: linear-gradient(135deg, var(--color-success), var(--color-info));
  border-radius: 50%;
  color: white;
}

.success-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.success-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.card-footer {
  padding: 0 var(--space-6) var(--space-6);
  text-align: center;
}

.expire-note {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
