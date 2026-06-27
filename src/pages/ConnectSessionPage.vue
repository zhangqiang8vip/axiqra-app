<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { connectApi } from '@/api'
import { DataState, Card, StatusBadge } from '@/components'
import type { ConnectSession, DoctorResult } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const session = ref<ConnectSession | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const doctorRunning = ref(false)
const doctorResult = ref<DoctorResult | null>(null)
const copied = ref(false)

async function loadSession() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = '无效的会话 ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    session.value = await connectApi.getSession(id)
    doctorResult.value = session.value.lastDoctorResult || null
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function runDoctor() {
  if (!session.value) return
  doctorRunning.value = true

  try {
    doctorResult.value = await connectApi.runDoctor(session.value.id)
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || '诊断失败')
  } finally {
    doctorRunning.value = false
  }
}

async function copyInstructions() {
  if (!session.value) return
  try {
    const { instructions } = await connectApi.getInstallInstructions(session.value.channel as 'cli' | 'mcp' | 'api', session.value.id)
    await navigator.clipboard.writeText(instructions)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

async function revokeSession() {
  if (!session.value) return
  if (!confirm('确定要撤销此会话吗？')) return

  try {
    await connectApi.revokeSession(session.value.id)
    router.push({ name: 'connect' })
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || '撤销失败')
  }
}

onMounted(loadSession)
</script>

<template>
  <div class="session-page">
    <DataState :loading="loading" :error="error">
      <template v-if="session">
        <header class="page-header">
          <button class="back-btn" @click="router.push({ name: 'connect' })">← {{ t('common.back') }}</button>
          <StatusBadge :status="session.status" type="session" />
        </header>

        <h1 class="page-title">{{ t('connect.session.title') }}</h1>

        <Card :title="t('connect.session.instructions')">
          <div class="instructions">
            <div class="instructions__channel">
              <span class="channel-badge">{{ session.channel.toUpperCase() }}</span>
              <span v-if="session.toolType" class="tool-type">{{ session.toolType }}</span>
            </div>
            <button class="btn btn--primary" @click="copyInstructions">
              {{ copied ? '✓ 已复制' : t('connect.session.copyInstructions') }}
            </button>
          </div>
        </Card>

        <Card :title="t('connect.session.doctorCheck')">
          <div class="doctor-section">
            <button class="btn btn--secondary" :disabled="doctorRunning" @click="runDoctor">
              {{ doctorRunning ? t('connect.session.running') : t('connect.session.runDoctor') }}
            </button>

            <div v-if="doctorResult" class="doctor-result">
              <div class="doctor-result__header">
                <span :class="['status-indicator', `status-indicator--${doctorResult.overall}`]">
                  <svg v-if="doctorResult.overall === 'pass'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg v-else-if="doctorResult.overall === 'fail'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {{ doctorResult.overall === 'pass' ? 'Passed' : doctorResult.overall === 'fail' ? 'Failed' : 'Warning' }}
                </span>
                <span class="doctor-result__time">{{ new Date(doctorResult.timestamp).toLocaleString() }}</span>
              </div>

              <div class="doctor-checks">
                <div v-for="(check, idx) in doctorResult.checks" :key="idx" class="check-item" :class="`check-item--${check.status}`">
                  <span class="check-item__status">
                    <svg v-if="check.status === 'pass'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg v-else-if="check.status === 'fail'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    <svg v-else-if="check.status === 'warning'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </span>
                  <span class="check-item__name">{{ check.name }}</span>
                  <span v-if="check.message" class="check-item__message">{{ check.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card v-if="session.scopes?.length" :title="t('connect.session.scopes')">
          <div class="scopes">
            <span v-for="scope in session.scopes" :key="scope" class="scope-badge">{{ scope }}</span>
          </div>
        </Card>

        <div class="actions">
          <button class="btn btn--danger" @click="revokeSession">
            {{ t('connect.session.revoke') }}
          </button>
        </div>
      </template>
    </DataState>
  </div>
</template>

<style scoped>
.session-page { max-width: var(--container-md); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.back-btn { background: none; border: none; color: var(--color-primary); cursor: pointer; }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-6); }
.instructions { display: flex; justify-content: space-between; align-items: center; }
.instructions__channel { display: flex; align-items: center; gap: var(--space-2); }
.channel-badge { padding: var(--space-1) var(--space-3); background: var(--color-primary); color: white; border-radius: var(--radius-md); font-weight: 600; }
.tool-type { color: var(--color-text-muted); }
.doctor-section { display: flex; flex-direction: column; gap: var(--space-4); }
.doctor-result { margin-top: var(--space-4); padding: var(--space-4); background: var(--color-bg-secondary); border-radius: var(--radius-lg); }
.doctor-result__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.status-indicator { padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); font-weight: 600; }
.status-indicator--pass { background: rgba(34, 197, 94, 0.1); color: var(--color-success); }
.status-indicator--fail { background: rgba(239, 68, 68, 0.1); color: var(--color-error); }
.status-indicator--warning { background: rgba(234, 179, 8, 0.1); color: var(--color-warning); }
.doctor-result__time { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.doctor-checks { display: flex; flex-direction: column; gap: var(--space-2); }
.check-item { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2); border-radius: var(--radius-md); }
.check-item--pass { background: rgba(34, 197, 94, 0.05); }
.check-item--fail { background: rgba(239, 68, 68, 0.05); }
.check-item--warning { background: rgba(234, 179, 8, 0.05); }
.check-item__status { font-weight: 600; }
.check-item__name { flex: 1; }
.check-item__message { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.scopes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.scope-badge { padding: var(--space-1) var(--space-3); background: var(--color-bg-secondary); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
.actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); }
.btn { padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; }
.btn--primary { background: var(--color-primary); color: white; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.btn--danger { background: var(--color-error); color: white; }
</style>
