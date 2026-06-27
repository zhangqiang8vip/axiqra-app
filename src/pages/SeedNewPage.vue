<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { seedApi } from '@/api'
import { Card } from '@/components'

const { t } = useI18n()
const router = useRouter()

const taskGoal = ref('')
const coverageGap = ref('')
const techStack = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!taskGoal.value.trim()) { error.value = '任务目标不能为空'; return }
  submitting.value = true
  error.value = null
  try {
    const seed = await seedApi.create({
      query: taskGoal.value.trim(),
      taskGoal: taskGoal.value.trim(),
      coverageGap: coverageGap.value.trim(),
      techStack: techStack.value.trim(),
    })
    router.push({ name: 'seed-detail', params: { id: seed.id } })
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '创建失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('seed.new.title') }}</h1>

    <Card :title="t('seed.form.taskGoal')">
      <textarea v-model="taskGoal" class="form-input" rows="4" :placeholder="t('seed.form.taskGoalPlaceholder')"></textarea>
    </Card>

    <Card :title="t('seed.form.techStack')">
      <input v-model="techStack" class="form-input" :placeholder="t('seed.form.techStackPlaceholder')" />
    </Card>

    <Card :title="t('seed.form.coverageGap')">
      <textarea v-model="coverageGap" class="form-input" rows="4" :placeholder="t('seed.form.coverageGapPlaceholder')"></textarea>
    </Card>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="actions">
      <button class="btn btn--secondary" @click="router.back()">{{ t('common.cancel') }}</button>
      <button class="btn btn--primary" :disabled="submitting" @click="submit">
        {{ submitting ? t('common.submitting') : t('seed.new.submit') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-md); margin: 0 auto; padding: var(--space-6) var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; }
.form-input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text-primary); }
.error { padding: var(--space-3); background: rgba(239, 68, 68, 0.1); color: var(--color-error); border-radius: var(--radius-md); }
.actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
.btn { padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; }
.btn--primary { background: var(--color-primary); color: white; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
</style>
