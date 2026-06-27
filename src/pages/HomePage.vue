<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useSearchStore } from '@/stores/search'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const searchStore = useSearchStore()

const searchQuery = ref('')
const isLoading = ref(false)

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  searchStore.setFilters({ query: searchQuery.value.trim() })
  router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}

function goToConnect() {
  if (authStore.isLoggedIn) {
    router.push({ name: 'connect' })
  } else {
    router.push({ name: 'login', query: { redirect: '/connect' } })
  }
}

function goToPublicCases() {
  router.push({ name: 'public-cases' })
}

function goToSearch() {
  router.push({ name: 'search' })
}

function goToRegister() {
  router.push({ name: 'register' })
}

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-grid"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          {{ t('home.hero.title') }}
        </h1>
        <p class="hero-subtitle">
          {{ t('home.hero.subtitle') }}
        </p>

        <!-- Search Box -->
        <div class="hero-search">
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="t('home.search.placeholder')"
              :disabled="isLoading"
              @keydown="handleKeydown"
            />
            <button class="search-btn" :disabled="isLoading || !searchQuery.trim()" @click="handleSearch">
              {{ t('common.search') }}
            </button>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="hero-links">
          <button class="quick-link" @click="goToPublicCases">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            {{ t('home.links.browseCases') }}
          </button>
          <button class="quick-link" @click="goToConnect">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
            </svg>
            {{ t('home.links.connectAI') }}
          </button>
          <button class="quick-link" @click="goToSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            {{ t('home.links.exploreSolutions') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Value Proposition -->
    <section class="features">
      <h2 class="section-title">{{ t('home.valueProps.title') }}</h2>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon feature-icon--blue">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ t('home.valueProps.forHumans.title') }}</h3>
          <p class="feature-desc">{{ t('home.valueProps.forHumans.desc') }}</p>
          <ul class="feature-list">
            <li>{{ t('home.valueProps.forHumans.feature1') }}</li>
            <li>{{ t('home.valueProps.forHumans.feature2') }}</li>
            <li>{{ t('home.valueProps.forHumans.feature3') }}</li>
          </ul>
          <button class="feature-btn" @click="goToPublicCases">
            {{ t('home.valueProps.forHumans.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <div class="feature-card">
          <div class="feature-icon feature-icon--purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <line x1="8" y1="16" x2="8" y2="16"/>
              <line x1="16" y1="16" x2="16" y2="16"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ t('home.valueProps.forAI.title') }}</h3>
          <p class="feature-desc">{{ t('home.valueProps.forAI.desc') }}</p>
          <ul class="feature-list">
            <li>{{ t('home.valueProps.forAI.feature1') }}</li>
            <li>{{ t('home.valueProps.forAI.feature2') }}</li>
            <li>{{ t('home.valueProps.forAI.feature3') }}</li>
          </ul>
          <button class="feature-btn" @click="goToConnect">
            {{ t('home.valueProps.forAI.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <div class="feature-card">
          <div class="feature-icon feature-icon--green">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ t('home.valueProps.traceFlow.title') }}</h3>
          <p class="feature-desc">{{ t('home.valueProps.traceFlow.desc') }}</p>
          <ul class="feature-list">
            <li>{{ t('home.valueProps.traceFlow.feature1') }}</li>
            <li>{{ t('home.valueProps.traceFlow.feature2') }}</li>
            <li>{{ t('home.valueProps.traceFlow.feature3') }}</li>
          </ul>
          <router-link :to="{ name: 'trace-new' }" class="feature-btn">
            {{ t('home.valueProps.traceFlow.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <h2 class="section-title">{{ t('home.howItWorks.title') }}</h2>

      <div class="workflow">
        <div class="workflow-step">
          <div class="workflow-number">1</div>
          <div class="workflow-content">
            <h3 class="workflow-title">{{ t('home.howItWorks.step1.title') }}</h3>
            <p class="workflow-desc">{{ t('home.howItWorks.step1.desc') }}</p>
          </div>
        </div>

        <div class="workflow-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="workflow-step">
          <div class="workflow-number">2</div>
          <div class="workflow-content">
            <h3 class="workflow-title">{{ t('home.howItWorks.step2.title') }}</h3>
            <p class="workflow-desc">{{ t('home.howItWorks.step2.desc') }}</p>
          </div>
        </div>

        <div class="workflow-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="workflow-step">
          <div class="workflow-number">3</div>
          <div class="workflow-content">
            <h3 class="workflow-title">{{ t('home.howItWorks.step3.title') }}</h3>
            <p class="workflow-desc">{{ t('home.howItWorks.step3.desc') }}</p>
          </div>
        </div>

        <div class="workflow-connector">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="workflow-step">
          <div class="workflow-number">4</div>
          <div class="workflow-content">
            <h3 class="workflow-title">{{ t('home.howItWorks.step4.title') }}</h3>
            <p class="workflow-desc">{{ t('home.howItWorks.step4.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="trust">
      <h2 class="section-title">{{ t('home.trust.title') }}</h2>

      <div class="trust-grid">
        <div class="trust-card">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 class="trust-title">{{ t('home.trust.riskLevel.title') }}</h3>
          <p class="trust-desc">{{ t('home.trust.riskLevel.desc') }}</p>
        </div>

        <div class="trust-card">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="trust-title">{{ t('home.trust.verificationLevel.title') }}</h3>
          <p class="trust-desc">{{ t('home.trust.verificationLevel.desc') }}</p>
        </div>

        <div class="trust-card">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 class="trust-title">{{ t('home.trust.review.title') }}</h3>
          <p class="trust-desc">{{ t('home.trust.review.desc') }}</p>
        </div>

        <div class="trust-card">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 class="trust-title">{{ t('home.trust.feedback.title') }}</h3>
          <p class="trust-desc">{{ t('home.trust.feedback.desc') }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-content">
        <h2 class="cta-title">{{ t('home.cta.title') }}</h2>
        <p class="cta-desc">{{ t('home.cta.desc') }}</p>
        <div class="cta-buttons">
          <button v-if="!authStore.isLoggedIn" class="btn btn-primary btn-lg" @click="goToRegister">
            {{ t('home.cta.startFree') }}
          </button>
          <button v-if="!authStore.isLoggedIn" class="btn btn-secondary btn-lg" @click="goToLogin">
            {{ t('home.cta.login') }}
          </button>
          <button class="btn btn-primary btn-lg" @click="handleSearch">
            {{ t('home.cta.searchNow') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 80px 24px 100px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg) 100%);
  opacity: 0.5;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 40px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.hero-search {
  margin-bottom: 32px;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
}

.search-icon {
  margin-left: 16px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 16px;
  font-size: 16px;
  color: var(--color-text-primary);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-btn {
  padding: 12px 28px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hero-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-link:hover {
  background: var(--color-primary);
  color: white;
}

.quick-link svg {
  opacity: 0.8;
}

/* Features Section */
.features {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 48px;
  letter-spacing: -0.01em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
  transition: all var(--transition-fast);
}

.feature-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 20px;
}

.feature-icon--blue {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.feature-icon--purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.feature-icon--green {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.feature-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.feature-list li {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.feature-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--color-success);
  border-radius: 50%;
}

.feature-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.feature-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* How It Works */
.how-it-works {
  padding: 80px 24px;
  background: var(--color-bg-secondary);
}

.workflow {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}

.workflow-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.workflow-number {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  font-size: 18px;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.workflow-content {
  text-align: left;
  max-width: 180px;
}

.workflow-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.workflow-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.workflow-connector {
  color: var(--color-text-tertiary);
  padding: 0 16px;
  flex-shrink: 0;
}

/* Trust Section */
.trust {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.trust-card {
  text-align: center;
  padding: 24px;
}

.trust-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  margin: 0 auto 16px;
  color: var(--color-primary);
}

.trust-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.trust-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* CTA Section */
.cta {
  padding: 80px 24px;
  background: var(--color-bg-secondary);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}

.cta-desc {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-text-tertiary);
}

.btn-lg {
  padding: 14px 32px;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .workflow {
    flex-direction: column;
    gap: 24px;
  }
  
  .workflow-connector {
    transform: rotate(90deg);
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .features-grid,
  .trust-grid {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    flex-direction: column;
    padding: 12px;
  }
  
  .search-input {
    width: 100%;
    text-align: center;
  }
  
  .search-btn {
    width: 100%;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .cta-buttons .btn {
    width: 100%;
  }
}
</style>
