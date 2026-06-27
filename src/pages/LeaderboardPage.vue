<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/client'
import { Card } from '@/components'

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'tools' | 'models'>('tools')

interface LeaderboardEntry {
  id: number
  name: string
  type: string
  score: number
  runs: number
  successRate: number
  avgResponseTime: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

const toolEntries = ref<LeaderboardEntry[]>([])
const modelEntries = ref<LeaderboardEntry[]>([])

const timeRange = ref<'week' | 'month' | 'all'>('month')

onMounted(async () => {
  loading.value = true
  try {
    // Mock data - replace with actual API call
    toolEntries.value = [
      { id: 1, name: 'Cursor Agent', type: 'tool', score: 98.5, runs: 15420, successRate: 94.2, avgResponseTime: 1.2, trend: 'up', change: 2.3 },
      { id: 2, name: 'Claude Code', type: 'tool', score: 96.8, runs: 12890, successRate: 92.1, avgResponseTime: 1.5, trend: 'stable', change: 0.5 },
      { id: 3, name: 'GitHub Copilot', type: 'tool', score: 94.2, runs: 22100, successRate: 88.7, avgResponseTime: 0.8, trend: 'down', change: -1.2 },
      { id: 4, name: 'Windsurf', type: 'tool', score: 91.5, runs: 8720, successRate: 85.3, avgResponseTime: 1.1, trend: 'up', change: 3.1 },
      { id: 5, name: 'Amazon Q Developer', type: 'tool', score: 89.3, runs: 6540, successRate: 82.8, avgResponseTime: 1.4, trend: 'up', change: 1.8 },
    ]
    
    modelEntries.value = [
      { id: 1, name: 'GPT-4o', type: 'model', score: 97.2, runs: 28500, successRate: 93.5, avgResponseTime: 1.8, trend: 'up', change: 1.5 },
      { id: 2, name: 'Claude 3.5 Sonnet', type: 'model', score: 96.5, runs: 24300, successRate: 92.8, avgResponseTime: 2.1, trend: 'stable', change: 0.2 },
      { id: 3, name: 'Gemini 1.5 Pro', type: 'model', score: 94.8, runs: 18900, successRate: 89.4, avgResponseTime: 1.6, trend: 'up', change: 2.1 },
      { id: 4, name: 'Llama 3.1 70B', type: 'model', score: 91.2, runs: 11200, successRate: 84.6, avgResponseTime: 2.5, trend: 'down', change: -0.8 },
      { id: 5, name: 'Mistral Large', type: 'model', score: 89.7, runs: 8900, successRate: 81.3, avgResponseTime: 1.9, trend: 'stable', change: 0.3 },
    ]
  } catch (err: any) {
    error.value = err?.message || t('leaderboard.loadError')
  } finally {
    loading.value = false
  }
})

const currentEntries = computed(() => activeTab.value === 'tools' ? toolEntries.value : modelEntries.value)

function getTrendIcon(trend: string): string {
  return ''
}

function getTrendClass(trend: string): string {
  const classes: Record<string, string> = {
    up: 'trend--up',
    down: 'trend--down',
    stable: 'trend--stable'
  }
  return classes[trend] || ''
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('leaderboard.title') }}</h1>
        <p class="page-subtitle">{{ t('leaderboard.subtitle') }}</p>
      </div>
      <select v-model="timeRange" class="select">
        <option value="week">{{ t('leaderboard.timeRange.week') }}</option>
        <option value="month">{{ t('leaderboard.timeRange.month') }}</option>
        <option value="all">{{ t('leaderboard.timeRange.allTime') }}</option>
      </select>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'tools' }"
        @click="activeTab = 'tools'"
      >
        {{ t('leaderboard.tabs.tools') }}
      </button>
      <button 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'models' }"
        @click="activeTab = 'models'"
      >
        {{ t('leaderboard.tabs.models') }}
      </button>
    </div>

    <!-- Leaderboard Table -->
    <Card>
      <div class="leaderboard">
        <div class="table-head">
          <span class="col-rank">#</span>
          <span class="col-name">{{ t('leaderboard.name') }}</span>
          <span class="col-score">{{ t('leaderboard.score') }}</span>
          <span class="col-runs">{{ t('leaderboard.runs') }}</span>
          <span class="col-rate">{{ t('leaderboard.successRate') }}</span>
          <span class="col-time">{{ t('leaderboard.avgTime') }}</span>
          <span class="col-trend">{{ t('leaderboard.trend') }}</span>
        </div>

        <div v-if="loading" class="loading-state">
          {{ t('common.loading') }}
        </div>

        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>

        <div v-else class="table-body">
          <div 
            v-for="(entry, index) in currentEntries" 
            :key="entry.id" 
            class="table-row"
            :class="{ 'row--top3': index < 3 }"
          >
            <span class="col-rank">
              <span v-if="index < 3" class="rank-medal" :class="`rank-medal--${index}`">
                {{ index + 1 }}
              </span>
              <span v-else class="rank-number">{{ index + 1 }}</span>
            </span>
            <span class="col-name">
              <strong>{{ entry.name }}</strong>
            </span>
            <span class="col-score">
              <span class="score-value">{{ entry.score.toFixed(1) }}</span>
            </span>
            <span class="col-runs">{{ entry.runs.toLocaleString() }}</span>
            <span class="col-rate">
              <span class="rate-value" :class="{ 'rate--high': entry.successRate >= 90 }">
                {{ entry.successRate.toFixed(1) }}%
              </span>
            </span>
            <span class="col-time">{{ entry.avgResponseTime.toFixed(1) }}s</span>
            <span class="col-trend">
              <span class="trend" :class="getTrendClass(entry.trend)">
                <svg v-if="entry.trend === 'up'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
                <svg v-else-if="entry.trend === 'down'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ entry.change > 0 ? '+' : '' }}{{ entry.change.toFixed(1) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Card>

    <!-- Info Section -->
    <div class="info-cards">
      <Card :title="t('leaderboard.howItWorks')">
        <div class="info-content">
          <p>{{ t('leaderboard.howItWorksDesc') }}</p>
          <ul>
            <li>{{ t('leaderboard.metric1') }}</li>
            <li>{{ t('leaderboard.metric2') }}</li>
            <li>{{ t('leaderboard.metric3') }}</li>
          </ul>
        </div>
      </Card>

      <Card :title="t('leaderboard.submitTool')">
        <div class="info-content">
          <p>{{ t('leaderboard.submitToolDesc') }}</p>
          <button class="btn btn--primary">{{ t('leaderboard.submitNow') }}</button>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-xl); margin: 0 auto; padding: var(--space-6) var(--space-4); }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin: 0 0 var(--space-2) 0; }
.page-subtitle { color: var(--color-text-muted); margin: 0; }

.select { 
  padding: var(--space-2) var(--space-4); 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
}

.tabs { display: flex; gap: var(--space-1); margin-bottom: var(--space-4); border-bottom: 1px solid var(--color-border); }
.tab { 
  padding: var(--space-3) var(--space-4); 
  background: none; 
  border: none; 
  cursor: pointer;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab:hover { color: var(--color-text-primary); }
.tab--active { 
  color: var(--color-primary); 
  border-bottom-color: var(--color-primary);
}

.leaderboard { overflow: hidden; }

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px 80px 100px;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
}

.table-head {
  background: var(--color-bg-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.table-row { border-bottom: 1px solid var(--color-border); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--color-bg-secondary); }
.row--top3 { background: rgba(37, 99, 235, 0.03); }

.col-rank { text-align: center; }
.rank-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  color: white;
}
.rank-medal--0 { background: #fbbf24; }
.rank-medal--1 { background: #9ca3af; }
.rank-medal--2 { background: #d97706; }
.rank-number { 
  display: inline-block; 
  width: 24px; 
  height: 24px; 
  line-height: 24px; 
  text-align: center; 
  border-radius: 50%; 
  background: var(--color-bg-secondary);
  font-size: var(--font-size-sm);
}

.score-value { font-weight: 700; color: var(--color-primary); }
.rate--high { color: var(--color-success); }

.trend { font-weight: 500; }
.trend--up { color: var(--color-success); }
.trend--down { color: var(--color-error); }
.trend--stable { color: var(--color-text-muted); }

.loading-state,
.error-state { padding: var(--space-8); text-align: center; color: var(--color-text-muted); }

.info-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4); margin-top: var(--space-6); }
.info-content p { color: var(--color-text-secondary); }
.info-content ul { padding-left: var(--space-5); color: var(--color-text-secondary); }
.info-content li { margin-bottom: var(--space-2); }
.info-content button { margin-top: var(--space-3); }

.btn { 
  padding: var(--space-2) var(--space-4); 
  border-radius: var(--radius-md); 
  font-weight: 500; 
  cursor: pointer; 
  border: none;
  transition: all 0.2s;
}
.btn--primary { background: var(--color-primary); color: white; }
.btn--primary:hover { opacity: 0.9; }

@media (max-width: 768px) {
  .table-head,
  .table-row {
    grid-template-columns: 50px 1fr 70px;
  }
  .col-runs, .col-rate, .col-time, .col-trend { display: none; }
}
</style>
