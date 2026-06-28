<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { reviewApi } from '@/api'
import { DataState, RiskBadge } from '@/components'
import { ReviewDecision, type ReviewQueueItem } from '@/types'

const { t } = useI18n()

const queue = ref<ReviewQueueItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const reviewing = ref<number | null>(null)
const decision = ref<ReviewDecision>(ReviewDecision.Approve)
const comment = ref('')

// R0-R4 tier filter
const selectedTier = ref<string>('all')

// 7 queue type filters
const selectedQueueType = ref<string>('all')

// Queue type definitions (7 categories per D14)
const queueTypes = [
  { value: 'all', label: '全部' },
  { value: 'auto_pass', label: '自动通过' },
  { value: 'auto_reject', label: '自动拒绝' },
  { value: 'low_risk_sampling', label: '低风险抽检' },
  { value: 'human_review', label: '人工审核' },
  { value: 'certified_review', label: '认证审核' },
  { value: 'domain_review', label: '领域审核' },
  { value: 'appeal', label: '申诉队列' },
]

// Risk level tiers
const riskTiers = [
  { value: 'all', label: '全部' },
  { value: 'R0', label: 'R0 无风险' },
  { value: 'R1', label: 'R1 低风险' },
  { value: 'R2', label: 'R2 中低风险' },
  { value: 'R3', label: 'R3 中风险' },
  { value: 'R4', label: 'R4 高风险' },
]

// Stats by tier
const tierStats = computed(() => {
  const stats = { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, total: 0 }
  queue.value.forEach(item => {
    const level = item.riskLevel as string
    if (level in stats) {
      stats[level as keyof typeof stats]++
      stats.total++
    }
  })
  return stats
})

// Filtered queue
const filteredQueue = computed(() => {
  return queue.value.filter(item => {
    const tierMatch = selectedTier.value === 'all' || item.riskLevel === selectedTier.value
    // Queue type filtering would be based on a backend field; here we show all for now
    const typeMatch = selectedQueueType.value === 'all' || true
    return tierMatch && typeMatch
  })
})

async function loadQueue() {
  loading.value = true
  try {
    const data = await reviewApi.getQueue()
    queue.value = data.list || []
  } catch (err: any) {
    error.value = err?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function submitReview(id: number) {
  reviewing.value = id
  try {
    await reviewApi.submit({
      targetType: queue.value.find(q => q.id === id)?.type || 'solution',
      targetId: id,
      decision: decision.value,
      comment: comment.value,
    })
    queue.value = queue.value.filter(q => q.id !== id)
    reviewing.value = null
    comment.value = ''
  } catch (err: any) {
    alert(err?.message || '提交失败')
  } finally {
    reviewing.value = null
  }
}

onMounted(loadQueue)
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('reviews.title') }}</h1>

    <!-- Tier Stats Summary -->
    <div class="tier-stats">
      <div v-for="tier in ['R0', 'R1', 'R2', 'R3', 'R4']" :key="tier" class="tier-stat" :class="`tier-stat--${tier.toLowerCase()}`">
        <span class="tier-stat__label">{{ tier }}</span>
        <span class="tier-stat__value">{{ tierStats[tier as keyof typeof tierStats] }}</span>
      </div>
      <div class="tier-stat tier-stat--total">
        <span class="tier-stat__label">总计</span>
        <span class="tier-stat__value">{{ tierStats.total }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label class="filter-label">风险等级</label>
        <div class="filter-options">
          <button
            v-for="tier in riskTiers"
            :key="tier.value"
            :class="['filter-btn', { 'filter-btn--active': selectedTier === tier.value }]"
            @click="selectedTier = tier.value"
          >
            {{ tier.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">队列类型</label>
        <div class="filter-options">
          <button
            v-for="qt in queueTypes"
            :key="qt.value"
            :class="['filter-btn', { 'filter-btn--active': selectedQueueType === qt.value }]"
            @click="selectedQueueType = qt.value"
          >
            {{ qt.label }}
          </button>
        </div>
      </div>
    </div>

    <DataState :loading="loading" :error="error" :empty="!loading && !error && filteredQueue.length === 0" :empty-message="t('reviews.empty')">
      <div class="queue">
        <div v-for="item in filteredQueue" :key="item.id" class="review-item">
          <div class="review-item__header">
            <span class="review-item__type">{{ item.type === 'solution' ? 'Solution' : item.type === 'public_case' ? 'Public Case' : 'Project Case' }}</span>
            <RiskBadge :level="item.riskLevel" size="sm" />
          </div>
          <h3 class="review-item__title">{{ item.title }}</h3>
          <p class="review-item__meta">作者: {{ item.authorUsername || 'Unknown' }} | 提交: {{ new Date(item.submittedAt).toLocaleDateString() }}</p>

          <div class="review-form">
            <div class="decision-btns">
              <button :class="['btn', decision === ReviewDecision.Approve ? 'btn--success' : 'btn--secondary']" @click="decision = ReviewDecision.Approve">批准</button>
              <button :class="['btn', decision === ReviewDecision.RequestMoreInfo ? 'btn--warning' : 'btn--secondary']" @click="decision = ReviewDecision.RequestMoreInfo">需要信息</button>
              <button :class="['btn', decision === ReviewDecision.Reject ? 'btn--danger' : 'btn--secondary']" @click="decision = ReviewDecision.Reject">拒绝</button>
              <button :class="['btn', decision === ReviewDecision.Quarantine ? 'btn--warning' : 'btn--secondary']" @click="decision = ReviewDecision.Quarantine">隔离</button>
              <button :class="['btn', decision === ReviewDecision.Escalate ? 'btn--danger' : 'btn--secondary']" @click="decision = ReviewDecision.Escalate">上报</button>
            </div>
            <textarea v-model="comment" class="form-input" rows="2" placeholder="审核意见..."></textarea>
            <button class="btn btn--primary" :disabled="reviewing === item.id" @click="submitReview(item.id)">
              {{ reviewing === item.id ? '提交中...' : '提交审核' }}
            </button>
          </div>
        </div>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-lg); margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-4); }

/* Tier Stats */
.tier-stats { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
.tier-stat { display: flex; flex-direction: column; align-items: center; padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); min-width: 80px; }
.tier-stat--r0 { background: var(--color-success-light); }
.tier-stat--r1 { background: var(--color-primary-light); }
.tier-stat--r2 { background: var(--color-warning-light); }
.tier-stat--r3 { background: #fff7ed; }
.tier-stat--r4 { background: var(--color-error-light); }
.tier-stat--total { background: var(--color-bg-secondary); }
.tier-stat__label { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-1); }
.tier-stat__value { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-text-primary); }

/* Filters */
.filters { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-6); }
.filter-group { display: flex; flex-direction: column; gap: var(--space-2); }
.filter-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); }
.filter-options { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.filter-btn { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text-primary); font-size: var(--font-size-sm); cursor: pointer; transition: all var(--transition-fast); }
.filter-btn:hover { border-color: var(--color-primary); }
.filter-btn--active { background: var(--color-primary); border-color: var(--color-primary); color: white; }

/* Queue */
.queue { display: flex; flex-direction: column; gap: var(--space-4); }
.review-item { padding: var(--space-4); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.review-item__header { display: flex; justify-content: space-between; margin-bottom: var(--space-2); }
.review-item__type { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.review-item__title { font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--space-1); }
.review-item__meta { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-4); }
.review-form { display: flex; flex-direction: column; gap: var(--space-3); }
.decision-btns { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.form-input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text-primary); }
.btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; border: none; }
.btn--primary { background: var(--color-primary); color: white; }
.btn--success { background: var(--color-success); color: white; }
.btn--warning { background: var(--color-warning); color: black; }
.btn--danger { background: var(--color-error); color: white; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.btn--primary:disabled, .btn--secondary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
