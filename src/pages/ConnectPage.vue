<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { connectApi } from '@/api'
import { DataState, Card, StatusBadge } from '@/components'
import type { ConnectSession, DoctorResult } from '@/types'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const sessions = ref<ConnectSession[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creatingSession = ref(false)
const selectedChannel = ref<'cli' | 'mcp' | 'api'>('cli')

const selectedSessionForDoctor = ref<ConnectSession | null>(null)
const doctorResult = ref<DoctorResult | null>(null)
const runningDoctor = ref(false)

async function loadSessions() {
  loading.value = true
  error.value = null
  try {
    const data = await connectApi.listSessions()
    sessions.value = data.list || []
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function createSession() {
  creatingSession.value = true
  try {
    const session = await connectApi.createSession({
      channel: selectedChannel.value,
      workspaceId: authStore.currentWorkspaceId || undefined,
    })
    router.push({ name: 'connect-session', params: { id: session.id } })
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || 'Failed to create')
  } finally {
    creatingSession.value = false
  }
}

async function runDoctorCheck(session: ConnectSession) {
  selectedSessionForDoctor.value = session
  runningDoctor.value = true
  doctorResult.value = null
  try {
    doctorResult.value = await connectApi.runDoctor(session.id)
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || 'Doctor check failed')
  } finally {
    runningDoctor.value = false
  }
}

onMounted(loadSessions)
</script>

<template>
  <div class="connect-page">
    <header class="page-header">
      <h1 class="page-title">{{ t('connect.title') }}</h1>
      <p class="page-desc">{{ t('connect.description') }}</p>
    </header>

    <Card :title="t('connect.createSession')">
      <div class="create-form">
        <div class="channel-select">
          <label class="channel-option" :class="{ 'channel-option--active': selectedChannel === 'cli' }">
            <input v-model="selectedChannel" type="radio" value="cli" />
            <div class="channel-card">
              <div class="channel-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <span class="channel-name">CLI</span>
              <span class="channel-desc">{{ t('connect.channels.cli') }}</span>
            </div>
          </label>

          <label class="channel-option" :class="{ 'channel-option--active': selectedChannel === 'mcp' }">
            <input v-model="selectedChannel" type="radio" value="mcp" />
            <div class="channel-card">
              <div class="channel-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22v-6"/>
                  <path d="M12 8V2"/>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 8a6 6 0 0 1 6 6"/>
                  <path d="M12 8a6 6 0 0 0-6 6"/>
                </svg>
              </div>
              <span class="channel-name">MCP</span>
              <span class="channel-desc">{{ t('connect.channels.mcp') }}</span>
            </div>
          </label>

          <label class="channel-option" :class="{ 'channel-option--active': selectedChannel === 'api' }">
            <input v-model="selectedChannel" type="radio" value="api" />
            <div class="channel-card">
              <div class="channel-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span class="channel-name">REST API</span>
              <span class="channel-desc">{{ t('connect.channels.api') }}</span>
            </div>
          </label>
        </div>

        <button class="btn btn-primary" :disabled="creatingSession" @click="createSession">
          <svg v-if="creatingSession" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
          </svg>
          {{ creatingSession ? t('connect.creating') : t('connect.create') }}
        </button>
      </div>
    </Card>

    <DataState :loading="loading" :error="error" :empty="!loading && !error && sessions.length === 0" :empty-message="t('connect.noSessions')">
      <Card v-if="sessions.length > 0" :title="t('connect.sessions')">
        <div class="sessions-list">
          <div v-for="session in sessions" :key="session.id" class="session-item">
            <div class="session-info" @click="router.push({ name: 'connect-session', params: { id: session.id } })">
              <span class="session-channel">{{ session.channel.toUpperCase() }}</span>
              <StatusBadge :status="session.status" type="session" size="sm" />
            </div>
            <div class="session-actions">
              <button
                class="btn btn-sm btn-secondary"
                :disabled="runningDoctor && selectedSessionForDoctor?.id === session.id"
                @click.stop="runDoctorCheck(session)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {{ runningDoctor && selectedSessionForDoctor?.id === session.id ? 'Running...' : 'Doctor' }}
              </button>
              <span class="session-date">{{ new Date(session.createdAt || '').toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </Card>
    </DataState>

    <Card v-if="doctorResult" :title="'Doctor Results'">
      <div class="doctor-result">
        <div class="doctor-header">
          <div class="doctor-status" :class="`doctor-status--${doctorResult.overall}`">
            <svg v-if="doctorResult.overall === 'pass'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else-if="doctorResult.overall === 'fail'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ doctorResult.overall === 'pass' ? 'Passed' : doctorResult.overall === 'fail' ? 'Failed' : 'Warning' }}
          </div>
          <span class="doctor-time">{{ new Date(doctorResult.timestamp).toLocaleString() }}</span>
        </div>
        <div class="doctor-checks">
          <div
            v-for="check in doctorResult.checks"
            :key="check.name"
            class="check-item"
            :class="`check-item--${check.status}`"
          >
            <div class="check-icon">
              <svg v-if="check.status === 'pass'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else-if="check.status === 'fail'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <svg v-else-if="check.status === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <div class="check-content">
              <span class="check-name">{{ check.name }}</span>
              <span v-if="check.message" class="check-message">{{ check.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card :title="t('connect.howItWorks')">
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">{{ t('connect.steps.step1') }}</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">{{ t('connect.steps.step2') }}</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">{{ t('connect.steps.step3') }}</div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-text">{{ t('connect.steps.step4') }}</div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.connect-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.page-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.channel-select {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.channel-option {
  cursor: pointer;
  flex: 1;
  min-width: 140px;
}

.channel-option input {
  display: none;
}

.channel-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  transition: all var(--transition-fast);
  background: var(--color-bg);
}

.channel-option--active .channel-card {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.channel-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.channel-option--active .channel-icon {
  background: var(--color-primary);
  color: white;
}

.channel-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.channel-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-align: center;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  transition: all var(--transition-fast);
}

.session-item:hover {
  background: var(--color-bg-tertiary);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.session-channel {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-date {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.doctor-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doctor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.doctor-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}

.doctor-status--pass {
  color: var(--color-success);
}

.doctor-status--fail {
  color: var(--color-error);
}

.doctor-status--warning {
  color: var(--color-warning);
}

.doctor-time {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.doctor-checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
}

.check-item--pass {
  background: rgba(16, 185, 129, 0.1);
}

.check-item--fail {
  background: rgba(239, 68, 68, 0.1);
}

.check-item--warning {
  background: rgba(245, 158, 11, 0.1);
}

.check-item--skip {
  background: var(--color-bg-secondary);
}

.check-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.check-item--pass .check-icon { color: var(--color-success); }
.check-item--fail .check-icon { color: var(--color-error); }
.check-item--warning .check-icon { color: var(--color-warning); }
.check-item--skip .check-icon { color: var(--color-text-tertiary); }

.check-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.check-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.check-message {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-text {
  line-height: 1.6;
  color: var(--color-text-secondary);
  font-size: 14px;
  padding-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-secondary);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .channel-select {
    flex-direction: column;
  }
  
  .session-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
