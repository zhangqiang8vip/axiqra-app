<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { traceApi } from '@/api'
import { DataState } from '@/components'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const trace = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const statusConfig = {
  draft: { label: '草稿', color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)' },
  pending: { label: '待确认', color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  confirmed: { label: '已确认', color: 'var(--color-primary)', bg: 'rgba(59, 130, 246, 0.1)' },
  processing: { label: '处理中', color: 'var(--color-info)', bg: 'rgba(59, 130, 246, 0.1)' },
  project_case_created: { label: '案例已创建', color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)' },
  rejected: { label: '已拒绝', color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' },
}

const traceStatus = computed(() => {
  if (!trace.value?.userConfirmationStatus) return null
  return statusConfig[trace.value.userConfirmationStatus as keyof typeof statusConfig] || statusConfig.draft
})

const riskLevelConfig = {
  R0: { label: '无风险', color: 'var(--color-success)' },
  R1: { label: '低风险', color: 'var(--color-success)' },
  R2: { label: '中低风险', color: 'var(--color-warning)' },
  R3: { label: '中风险', color: 'var(--color-warning)' },
  R4: { label: '高风险', color: 'var(--color-error)' },
}

const riskConfig = computed(() => {
  if (!trace.value?.riskLevel) return riskLevelConfig.R1
  return riskLevelConfig[trace.value.riskLevel as keyof typeof riskLevelConfig] || riskLevelConfig.R1
})

async function loadTrace() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = '无效的轨迹 ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    trace.value = await traceApi.getById(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function goToConfirm() {
  router.push({ name: 'trace-confirm', params: { id: route.params.id } })
}

function goBack() {
  router.push({ name: 'traces' })
}

onMounted(loadTrace)
</script>

<template>
  <div class="trace-detail-page">
    <DataState :loading="loading" :error="error">
      <template v-if="trace">
        <!-- Header -->
        <header class="page-header">
          <div class="header-left">
            <button class="btn btn--ghost" @click="goBack">
              ← {{ t('common.back') }}
            </button>
            <h1 class="page-title">{{ t('trace.detail.title') }}</h1>
          </div>
          <div class="header-right">
            <span v-if="traceStatus" class="status-badge" :style="{ color: traceStatus.color, background: traceStatus.bg }">
              {{ traceStatus.label }}
            </span>
          </div>
        </header>

        <!-- Meta Info -->
        <div class="meta-info">
          <span class="meta-item">
            <span class="meta-label">ID:</span>
            <span class="meta-value">{{ trace.id }}</span>
          </span>
          <span v-if="trace.createdAt" class="meta-item">
            <span class="meta-label">创建:</span>
            <span class="meta-value">{{ new Date(trace.createdAt).toLocaleString() }}</span>
          </span>
          <span v-if="trace.updatedAt" class="meta-item">
            <span class="meta-label">更新:</span>
            <span class="meta-value">{{ new Date(trace.updatedAt).toLocaleString() }}</span>
          </span>
        </div>

        <!-- Risk Level Badge -->
        <div class="risk-badge" :style="{ color: riskConfig.color }">
          <span class="risk-level">{{ trace.riskLevel || 'R1' }}</span>
          <span class="risk-label">{{ riskConfig.label }}</span>
        </div>

        <!-- 9-Block Content -->
        <div class="content-grid">
          <!-- Block 1: Task Goal -->
          <Card :title="t('trace.form.taskGoal')">
            <p class="content-text">{{ trace.taskGoal || '-' }}</p>
          </Card>

          <!-- Block 2: Project Context -->
          <Card :title="t('trace.form.projectContext')">
            <p class="content-text">{{ trace.projectContext || '-' }}</p>
          </Card>

          <!-- Block 3: Forward Path -->
          <Card :title="t('trace.form.forwardSteps')">
            <div v-if="trace.forwardPath?.length" class="steps-list">
              <div v-for="(step, idx) in trace.forwardPath" :key="idx" class="step-item">
                <div class="step-num">{{ idx + 1 }}</div>
                <div class="step-content">
                  <p class="step-text">{{ step.step }}</p>
                  <div v-if="step.command" class="step-command">
                    <code>{{ step.command }}</code>
                  </div>
                  <p v-if="step.result" class="step-result">{{ step.result }}</p>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">-</p>
          </Card>

          <!-- Block 4: Reverse Path -->
          <Card :title="t('trace.form.reversePath')">
            <ul v-if="trace.reversePath?.length" class="path-list">
              <li v-for="(item, idx) in trace.reversePath" :key="idx">{{ item }}</li>
            </ul>
            <p v-else class="empty-text">-</p>
          </Card>

          <!-- Block 5: Failure Path -->
          <Card :title="t('trace.form.failurePath')">
            <ul v-if="trace.failurePath?.length" class="path-list">
              <li v-for="(item, idx) in trace.failurePath" :key="idx">{{ item }}</li>
            </ul>
            <p v-else class="empty-text">-</p>
          </Card>

          <!-- Block 6: Decision Path (A2) -->
          <Card :title="t('trace.form.decisionPath')">
            <div v-if="trace.decisionPath?.length" class="decisions-list">
              <div v-for="(decision, idx) in trace.decisionPath" :key="idx" class="decision-item">
                <div class="decision-num">{{ idx + 1 }}</div>
                <div class="decision-content">
                  <div class="decision-field">
                    <span class="field-label">{{ t('trace.form.decisionSituation') }}</span>
                    <p>{{ decision.situation }}</p>
                  </div>
                  <div v-if="decision.options?.length" class="decision-field">
                    <span class="field-label">{{ t('trace.form.decisionOptions') }}</span>
                    <ul class="options-list">
                      <li v-for="(opt, optIdx) in decision.options" :key="optIdx" :class="{ 'chosen': opt === decision.chosen }">
                        {{ opt }}{{ opt === decision.chosen ? ' ✓' : '' }}
                      </li>
                    </ul>
                  </div>
                  <div v-if="decision.reason" class="decision-field">
                    <span class="field-label">{{ t('trace.form.decisionReason') }}</span>
                    <p>{{ decision.reason }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">-</p>
          </Card>

          <!-- Block 7: Rollback Path (A2) -->
          <Card :title="t('trace.form.rollbackPath')">
            <p class="content-text">{{ trace.rollbackPath || '-' }}</p>
          </Card>

          <!-- Block 8: Evolution Hint (A2) -->
          <Card :title="t('trace.form.evolutionHint')">
            <p class="content-text">{{ trace.evolutionHint || '-' }}</p>
          </Card>

          <!-- Block 9: Outcome (for confirmed traces) -->
          <Card v-if="trace.outcome || trace.userConfirmationStatus === 'confirmed'" :title="t('trace.confirm.outcome')">
            <p class="content-text">{{ trace.outcome || '-' }}</p>
          </Card>
        </div>

        <!-- Actions -->
        <div v-if="trace.userConfirmationStatus === 'draft' || trace.userConfirmationStatus === 'pending'" class="action-bar">
          <button class="btn btn--primary" @click="goToConfirm">
            {{ t('trace.confirm.title') }}
          </button>
        </div>
      </template>
    </DataState>
  </div>
</template>

<style scoped>
.trace-detail-page {
  max-width: var(--container-md);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.status-badge {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.meta-info {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.meta-item {
  display: flex;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.meta-label {
  color: var(--color-text-muted);
}

.meta-value {
  color: var(--color-text-primary);
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding: var(--space-2) var(--space-3);
  background: currentColor;
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.risk-badge .risk-level {
  font-weight: 700;
  font-size: var(--font-size-base);
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.empty-text {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Steps */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.step-item {
  display: flex;
  gap: var(--space-3);
}

.step-num {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-text {
  margin-bottom: var(--space-2);
}

.step-command {
  margin: var(--space-2) 0;
}

.step-command code {
  display: block;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  overflow-x: auto;
}

.step-result {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Path Lists */
.path-list {
  margin: 0;
  padding-left: var(--space-5);
}

.path-list li {
  margin-bottom: var(--space-2);
  line-height: 1.6;
}

/* Decision Path */
.decisions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.decision-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.decision-num {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.decision-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.decision-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.options-list {
  margin: 0;
  padding-left: var(--space-4);
}

.options-list li {
  margin-bottom: var(--space-1);
}

.options-list li.chosen {
  color: var(--color-success);
  font-weight: 600;
}

/* Action Bar */
.action-bar {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  padding: var(--space-2) 0;
}

.btn--ghost:hover {
  color: var(--color-text-primary);
}
</style>
