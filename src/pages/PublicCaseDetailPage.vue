<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { publicCaseApi } from '@/api'
import { DataState, RiskBadge, VerificationBadge, Card } from '@/components'
import type { PublicCase } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const publicCase = ref<PublicCase | null>(null)

async function loadPublicCase() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = '无效的案例 ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    publicCase.value = await publicCaseApi.getById(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'public-cases' })
}

function submitFeedback(type: 'helpful' | 'correction' | '看不懂') {
  if (!publicCase.value) return

  publicCaseApi.submitFeedback(publicCase.value.id, { type })
    .then(() => {
      alert(t('publicCase.feedbackSuccess'))
    })
    .catch((err) => {
      alert(err?.message || t('publicCase.feedbackFailed'))
    })
}

onMounted(loadPublicCase)
</script>

<template>
  <div class="public-case-page">
    <DataState :loading="loading" :error="error">
      <template v-if="publicCase">
        <header class="page-header">
          <button class="back-btn" @click="goBack">← {{ t('common.back') }}</button>
          <div class="page-header__meta">
            <RiskBadge :level="publicCase.riskLevel" />
            <VerificationBadge :level="publicCase.verificationLevel" />
          </div>
        </header>

        <h1 class="page-title">{{ publicCase.title }}</h1>

        <Card :title="t('publicCase.problemStatement')">
          <p class="content-text">{{ publicCase.problemStatement }}</p>
        </Card>

        <Card :title="t('publicCase.techEnvironment')">
          <div class="meta-grid">
            <div><strong>{{ t('publicCase.techStack') }}:</strong> {{ publicCase.techStack }}</div>
            <div><strong>{{ t('publicCase.environment') }}:</strong> {{ publicCase.environment }}</div>
          </div>
        </Card>

        <Card :title="t('publicCase.rootCause')">
          <p class="content-text">{{ publicCase.rootCause }}</p>
        </Card>

        <Card :title="t('publicCase.learningSummary')">
          <p class="content-text">{{ publicCase.learningSummary }}</p>
        </Card>

        <Card :title="t('publicCase.feedback')">
          <div class="feedback-buttons">
            <button class="btn btn--success" @click="submitFeedback('helpful')">👍 {{ t('publicCase.feedbackHelpful') }}</button>
            <button class="btn btn--secondary" @click="submitFeedback('correction')">📝 {{ t('publicCase.feedbackCorrection') }}</button>
            <button class="btn btn--secondary" @click="submitFeedback('看不懂')">❓ {{ t('publicCase.feedbackUnclear') }}</button>
          </div>
        </Card>
      </template>
    </DataState>
  </div>
</template>

<style scoped>
.public-case-page { max-width: var(--container-lg); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.back-btn { background: none; border: none; color: var(--color-primary); cursor: pointer; font-size: var(--font-size-sm); }
.page-header__meta { display: flex; gap: var(--space-2); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-6); }
.content-text { line-height: 1.7; color: var(--color-text-secondary); }
.meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
.feedback-buttons { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.btn { padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; font-size: var(--font-size-sm); cursor: pointer; border: none; }
.btn--success { background: var(--color-success); color: white; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); border: 1px solid var(--color-border); }
</style>
