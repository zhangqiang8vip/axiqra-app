<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { solutionApi } from '@/api'
import { DataState, RiskBadge, VerificationBadge, StatusBadge, Card } from '@/components'
import type { Solution, FeedbackResult } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const solution = ref<Solution | null>(null)
const viewMode = ref<'execution' | 'learning'>('execution')

async function loadSolution() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = '无效的方案 ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    solution.value = await solutionApi.getById(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function submitFeedback(result: FeedbackResult) {
  if (!solution.value) return

  solutionApi.submitFeedback(solution.value.id, {
    invocationId: 0,
    result,
    reason: '',
  }).then(() => {
    alert(t('solution.feedbackSuccess'))
  }).catch((err) => {
    alert(err?.message || t('solution.feedbackFailed'))
  })
}

function goBack() {
  router.push({ name: 'solutions' })
}

onMounted(loadSolution)
</script>

<template>
  <div class="solution-page">
    <DataState :loading="loading" :error="error">
      <template v-if="solution">
        <header class="page-header">
          <button class="back-btn" @click="goBack">← {{ t('common.back') }}</button>
          <div class="page-header__meta">
            <StatusBadge :status="solution.status" type="solution" />
            <RiskBadge :level="solution.riskLevel" />
            <VerificationBadge :level="solution.verificationLevel" />
          </div>
        </header>

        <h1 class="page-title">{{ solution.title }}</h1>

        <div class="view-toggle">
          <button :class="['view-toggle__btn', { 'view-toggle__btn--active': viewMode === 'execution' }]" @click="viewMode = 'execution'">
            {{ t('solution.executionView') }}
          </button>
          <button :class="['view-toggle__btn', { 'view-toggle__btn--active': viewMode === 'learning' }]" @click="viewMode = 'learning'">
            {{ t('solution.learningView') }}
          </button>
        </div>

        <div v-if="viewMode === 'execution'" class="view-content">
          <Card :title="t('solution.applicableScenario')">
            <p>{{ solution.applicableScenario }}</p>
          </Card>

          <Card :title="t('solution.inapplicableBoundary')">
            <p>{{ solution.inapplicableBoundary }}</p>
          </Card>

          <Card :title="t('solution.prerequisites')">
            <ul class="list">
              <li v-for="(prereq, idx) in solution.prerequisites" :key="idx">{{ prereq }}</li>
            </ul>
          </Card>

          <Card :title="t('solution.riskNotes')">
            <ul class="list list--warning">
              <li v-for="(note, idx) in solution.riskNotes" :key="idx">{{ note }}</li>
            </ul>
          </Card>
        </div>

        <div v-if="viewMode === 'learning'" class="view-content">
          <Card :title="t('solution.whyItWorks')">
            <p>{{ solution.whyItWorks }}</p>
          </Card>

          <Card :title="t('solution.feedbackStats')">
            <div class="stats">
              <div class="stat">
                <span class="stat__value">{{ solution.invocationCount }}</span>
                <span class="stat__label">{{ t('solution.invocationCount') }}</span>
              </div>
              <div class="stat">
                <span class="stat__value">{{ solution.sampleSize >= 5 ? `${(solution.successRate * 100).toFixed(0)}%` : 'N/A' }}</span>
                <span class="stat__label">{{ t('solution.successRate') }}</span>
              </div>
            </div>

            <div class="feedback-buttons">
              <button class="btn btn--success" @click="submitFeedback('worked' as FeedbackResult)">✓ {{ t('solution.worked') }}</button>
              <button class="btn btn--danger" @click="submitFeedback('failed' as FeedbackResult)">✕ {{ t('solution.failed') }}</button>
              <button class="btn btn--warning" @click="submitFeedback('partial' as FeedbackResult)">~ {{ t('solution.partial') }}</button>
              <button class="btn btn--secondary" @click="submitFeedback('not_applicable' as FeedbackResult)">N/A {{ t('solution.notApplicable') }}</button>
            </div>
          </Card>
        </div>
      </template>
    </DataState>
  </div>
</template>

<style scoped>
.solution-page { max-width: var(--container-lg); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.back-btn { background: none; border: none; color: var(--color-primary); cursor: pointer; font-size: var(--font-size-sm); }
.page-header__meta { display: flex; gap: var(--space-2); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-6); }
.view-toggle { display: flex; gap: var(--space-2); margin-bottom: var(--space-6); padding: var(--space-1); background: var(--color-bg-secondary); border-radius: var(--radius-lg); width: fit-content; }
.view-toggle__btn { padding: var(--space-2) var(--space-4); border: none; background: transparent; color: var(--color-text-secondary); border-radius: var(--radius-md); cursor: pointer; font-weight: 500; }
.view-toggle__btn--active { background: var(--color-bg); color: var(--color-text-primary); box-shadow: var(--shadow-sm); }
.view-content { display: flex; flex-direction: column; gap: var(--space-4); }
.list { padding-left: var(--space-6); }
.list li { margin-bottom: var(--space-2); line-height: 1.6; }
.list--warning li::marker { color: var(--color-warning); }
.stats { display: flex; gap: var(--space-8); margin-bottom: var(--space-4); }
.stat { text-align: center; }
.stat__value { display: block; font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-primary); }
.stat__label { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.feedback-buttons { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-sm); cursor: pointer; border: none; }
.btn--success { background: var(--color-success); color: white; }
.btn--danger { background: var(--color-error); color: white; }
.btn--warning { background: var(--color-warning); color: black; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
</style>
