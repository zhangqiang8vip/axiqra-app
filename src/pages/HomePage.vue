<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleSearch() {
  if (!searchQuery.value.trim()) return
  console.log('Search:', searchQuery.value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}

const categories = [
  {
    key: 'codeCompletion',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    color: '#3b82f6',
  },
  {
    key: 'refactoring',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    color: '#10b981',
  },
  {
    key: 'debugging',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    color: '#ef4444',
  },
  {
    key: 'codeReview',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    color: '#8b5cf6',
  },
  {
    key: 'documentation',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    color: '#f59e0b',
  },
  {
    key: 'testing',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    color: '#06b6d4',
  },
]

const stats = { traces: '2,847+', solutions: '12,840+', tools: '23+', teams: '156+' }
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-inner">
        <!-- Badge -->
        <div class="hero-badge">
          AI Engineering Knowledge Base
        </div>

        <!-- Title -->
        <h1 class="hero-title">
          {{ t('hero.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle">
          {{ t('hero.subtitle') }}
        </p>

        <!-- Search bar -->
        <div class="search-wrapper">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="search"
              class="search-input"
              :placeholder="t('hero.placeholder')"
              @keydown="handleKeydown"
            />
            <button class="search-btn" @click="handleSearch">
              {{ t('hero.search') }}
            </button>
          </div>
        </div>

        <!-- Browse categories -->
        <p class="browse-label">{{ t('hero.orBrowse') }}</p>
        <div class="category-pills">
          <a
            v-for="cat in categories"
            :key="cat.key"
            href="/public-cases"
            class="category-pill"
            :style="{ '--pill-color': cat.color }"
          >
            <span class="pill-icon" v-html="cat.icon" />
            <span>{{ t(`categories.${cat.key}`) }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.traces }}</div>
          <div class="stat-label">{{ t('stats.traces') }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-card">
          <div class="stat-number">{{ stats.solutions }}</div>
          <div class="stat-label">{{ t('stats.solutions') }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-card">
          <div class="stat-number">{{ stats.tools }}</div>
          <div class="stat-label">{{ t('stats.tools') }}</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-card">
          <div class="stat-number">{{ stats.teams }}</div>
          <div class="stat-label">{{ t('stats.teams') }}</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">{{ t('features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon feature-icon--blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.fastSearch.title') }}</h3>
            <p class="feature-desc">{{ t('features.fastSearch.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon feature-icon--green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.aiNative.title') }}</h3>
            <p class="feature-desc">{{ t('features.aiNative.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon feature-icon--purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.traceable.title') }}</h3>
            <p class="feature-desc">{{ t('features.traceable.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon feature-icon--orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.collaborative.title') }}</h3>
            <p class="feature-desc">{{ t('features.collaborative.desc') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
}

/* Hero */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - 56px);
  padding: var(--space-24) var(--space-6);
  z-index: 1;
  /* Let the canvas show through as a starfield */
  background: transparent;
}

.hero-inner {
  max-width: 680px;
  text-align: center;
}

/* Badge — clean, no animation */
.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Title — solid, no gradient */
.hero-title {
  font-size: clamp(var(--text-3xl), 6vw, var(--text-5xl));
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: var(--space-5);
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-10);
  max-width: 560px;
  margin-inline: auto;
}

/* Search */
.search-wrapper {
  margin-bottom: var(--space-8);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 540px;
  margin: 0 auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  overflow: hidden;
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm), 0 0 0 3px var(--color-primary-light);
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  color: var(--color-text-tertiary);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: var(--space-4) var(--space-4) var(--space-4) 44px;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-btn {
  padding: var(--space-2) var(--space-5);
  margin-right: var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.search-btn:hover {
  background: var(--color-primary-hover);
}

/* Browse label + pills */
.browse-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.category-pill:hover {
  color: var(--pill-color);
  border-color: var(--pill-color);
  background: var(--color-bg);
  text-decoration: none;
}

.pill-icon {
  display: flex;
  align-items: center;
  color: var(--pill-color);
}

/* Stats */
.stats-section {
  position: relative;
  z-index: 1;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-12) 0;
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: var(--space-4) var(--space-6);
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

/* Features */
.features-section {
  position: relative;
  z-index: 1;
  padding: var(--space-20) 0;
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--space-12);
  letter-spacing: -0.02em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}

.feature-card {
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.feature-icon--blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.feature-icon--green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.feature-icon--purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.feature-icon--orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.feature-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
</style>
