<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { traceApi } from '@/api'
import { DataState, Card } from '@/components'

const route = useRoute()
const router = useRouter()

const trace = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)
const outcome = ref('')

async function loadTrace() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) { error.value = '无效的轨迹 ID'; loading.value = false; return }

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

async function confirmTrace() {
  if (!trace.value) return
  submitting.value = true
  try {
    const result = await traceApi.confirm(trace.value.id, { ...trace.value, outcome: outcome.value })
    if (result.projectCaseId) {
      router.push({ name: 'project-case-detail', params: { id: result.projectCaseId } })
    } else {
      router.push({ name: 'project-cases' })
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || err?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadTrace)
</script>

<template>
  <div class="confirm-page">
    <DataState :loading="loading" :error="error">
      <template v-if="trace">
        <header class="page-header">
          <h1 class="page-title">确认轨迹</h1>
        </header>

        <Card title="任务目标">
          <p>{{ trace.taskGoal }}</p>
        </Card>

        <Card title="执行结果">
          <textarea v-model="outcome" class="form-input" rows="4" placeholder="描述任务的执行结果..."></textarea>
        </Card>

        <div class="actions">
          <button class="btn btn--secondary" @click="router.back()">取消</button>
          <button class="btn btn--primary" :disabled="submitting" @click="confirmTrace">
            {{ submitting ? '提交中...' : '确认提交' }}
          </button>
        </div>
      </template>
    </DataState>
  </div>
</template>

<style scoped>
.confirm-page { max-width: var(--container-md); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-6); }
.form-input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text-primary); }
.actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); }
.btn { padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; }
.btn--primary { background: var(--color-primary); color: white; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
</style>
