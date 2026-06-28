<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const contributionStats = ref({
  totalPoints: 0,
  tracesContributed: 0,
  solutionsContributed: 0,
  casesContributed: 0,
})

const userAvatar = computed(() => authStore.getAvatarUrl())
const username = computed(() => authStore.user?.username || 'User')

const tiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 100, color: '#cd7f32' },
  { name: 'Silver', minPoints: 101, maxPoints: 500, color: '#c0c0c0' },
  { name: 'Gold', minPoints: 501, maxPoints: 2000, color: '#ffd700' },
  { name: 'Platinum', minPoints: 2001, maxPoints: 10000, color: '#94a3b8' },
  { name: 'Diamond', minPoints: 10001, maxPoints: Infinity, color: '#60a5fa' },
] as const

const currentTier = computed(() => {
  return tiers.find(t => contributionStats.value.totalPoints >= t.minPoints && contributionStats.value.totalPoints <= t.maxPoints) ?? tiers[0]
})

const pointsToNextTier = computed(() => {
  const nextTierIndex = tiers.findIndex(t => t.name === currentTier.value.name) + 1
  if (nextTierIndex >= tiers.length) return null
  const nextTier = tiers[nextTierIndex]
  return nextTier ? nextTier.minPoints - contributionStats.value.totalPoints : null
})

const tierProgress = computed(() => {
  const range = currentTier.value.maxPoints - currentTier.value.minPoints
  const progress = contributionStats.value.totalPoints - currentTier.value.minPoints
  return Math.min(100, Math.round((progress / range) * 100))
})

async function loadContributions() {
  loading.value = true
  try {
    const workspaceId = authStore.currentWorkspaceId
    const [traceRes, solutionRes, caseRes] = await Promise.allSettled([
      apiClient.get('/traces', { params: { workspaceId, page: 1, pageSize: 10 } }),
      apiClient.get('/solutions', { params: { workspaceId, page: 1, pageSize: 10 } }),
      apiClient.get('/public-cases', { params: { workspaceId, page: 1, pageSize: 10 } }),
    ])

    let tracesCount = 0, solutionsCount = 0, casesCount = 0

    if (traceRes.status === 'fulfilled' && traceRes.value.data?.code === 0) {
      tracesCount = traceRes.value.data.data?.total || 0
    }
    if (solutionRes.status === 'fulfilled' && solutionRes.value.data?.code === 0) {
      solutionsCount = solutionRes.value.data.data?.total || 0
    }
    if (caseRes.status === 'fulfilled' && caseRes.value.data?.code === 0) {
      casesCount = caseRes.value.data?.total || 0
    }

    contributionStats.value = {
      totalPoints: tracesCount * 10 + solutionsCount * 50 + casesCount * 30,
      tracesContributed: tracesCount,
      solutionsContributed: solutionsCount,
      casesContributed: casesCount,
    }
  } catch (err) {
    console.error('Failed to load contributions:', err)
  } finally {
    loading.value = false
  }
}

function navigateTo(path: string) {
  router.push(path)
}

onMounted(loadContributions)
</script>

<template>
  <div class="contribution-page">
    <div class="page-header-section">
      <div class="user-info">
        <img :src="userAvatar" :alt="username" class="user-avatar" />
        <div class="user-details">
          <h1 class="user-name">{{ username }}</h1>
          <p class="user-role">Contribution Center</p>
        </div>
      </div>
      <div class="tier-badge" :style="{ '--tier-color': currentTier.color }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>{{ currentTier.name }}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-card--primary">
        <div class="stat-label">Total Points</div>
        <div class="stat-value">{{ contributionStats.totalPoints.toLocaleString() }}</div>
        <div class="stat-hint">Current: {{ currentTier.name }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Traces</div>
        <div class="stat-value">{{ contributionStats.tracesContributed }}</div>
        <div class="stat-hint">+10 pts each</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Solutions</div>
        <div class="stat-value">{{ contributionStats.solutionsContributed }}</div>
        <div class="stat-hint">+50 pts each</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cases</div>
        <div class="stat-value">{{ contributionStats.casesContributed }}</div>
        <div class="stat-hint">+30 pts each</div>
      </div>
    </div>

    <div class="tier-section">
      <div class="tier-header">
        <h3 class="section-title">Level Progress</h3>
        <span v-if="pointsToNextTier !== null" class="next-tier-hint">
          {{ pointsToNextTier.toLocaleString() }} pts to {{ tiers[tiers.findIndex(t => t.name === currentTier.name) + 1]?.name }}
        </span>
      </div>
      <div class="tier-progress">
        <div class="tier-progress-bar">
          <div 
            class="tier-progress-fill" 
            :style="{ width: tierProgress + '%', background: currentTier.color }"
          ></div>
        </div>
        <div class="tier-levels">
          <span 
            v-for="tier in tiers" 
            :key="tier.name"
            class="tier-level"
            :class="{ 'tier-level--active': tier.name === currentTier.name }"
          >
            {{ tier.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <h3 class="section-title">Contribution Ways</h3>
      <div class="actions-grid">
        <button class="action-card" @click="navigateTo('/traces/new')">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Submit Trace</span>
            <span class="action-desc">Record engineering process</span>
          </div>
          <span class="action-points">+10</span>
        </button>

        <button class="action-card" @click="navigateTo('/solutions/new')">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Create Solution</span>
            <span class="action-desc">Share best practices</span>
          </div>
          <span class="action-points">+50</span>
        </button>

        <button class="action-card" @click="navigateTo('/public-cases/new')">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Publish Case</span>
            <span class="action-desc">Share project stories</span>
          </div>
          <span class="action-points">+30</span>
        </button>

        <button class="action-card" @click="navigateTo('/reviews')">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Review Content</span>
            <span class="action-desc">Help quality control</span>
          </div>
          <span class="action-points">+5</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contribution-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.user-role {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.tier-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--tier-color, var(--color-primary));
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
}

.stat-card--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.stat-card--primary .stat-label,
.stat-card--primary .stat-hint {
  color: rgba(255, 255, 255, 0.8);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.tier-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
  margin-bottom: 24px;
}

.tier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.next-tier-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.tier-progress-bar {
  height: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 12px;
}

.tier-progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.tier-levels {
  display: flex;
  justify-content: space-between;
}

.tier-level {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.tier-level--active {
  color: var(--color-text-primary);
  font-weight: 600;
}

.actions-section {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.action-card:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.action-desc {
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.action-points {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
  padding: 4px 8px;
  background: var(--color-success-light);
  border-radius: var(--radius-md);
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contribution-page {
    padding: 16px;
  }
  
  .page-header-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .user-info {
    flex-direction: column;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
