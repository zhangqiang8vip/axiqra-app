<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDark = computed(() => themeStore.theme === 'dark')
const isLoggedIn = computed(() => authStore.isLoggedIn())
const userMenuOpen = ref(false)

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'zh' : 'en')
}

function handleLogout() {
  authStore.logout()
  userMenuOpen.value = false
  router.push('/login')
}

// Starfield canvas — lives in layout so it covers the whole viewport
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrame: number
let mouse = { x: -2000, y: -2000 }

const PALETTE: Array<[number, number, number]> = [
  [37, 99, 235],
  [6, 182, 212],
  [20, 184, 166],
  [99, 102, 241],
  [139, 92, 246],
  [168, 85, 247],
  [251, 191, 36],
  [45, 212, 191],
]
const DEFAULT_STAR_COLOR: [number, number, number] = [37, 99, 235]

interface Star {
  x: number; y: number
  vx: number; vy: number
  r: number
  color: [number, number, number]
}

function initStarfield() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const CONNECT_DIST = 160
  const MOUSE_ATTRACT = 200
  const stars: Star[] = []
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 0.35 + 0.08
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 2 + 0.5,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)] ?? DEFAULT_STAR_COLOR,
    })
  }

  function draw() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const W = canvas.width, H = canvas.height

    for (const s of stars) {
      const mdx = mouse.x - s.x, mdy = mouse.y - s.y
      const md = Math.sqrt(mdx * mdx + mdy * mdy)
      if (md < MOUSE_ATTRACT && md > 0) {
        const f = 0.0003 * (1 - md / MOUSE_ATTRACT)
        s.vx += mdx * f
        s.vy += mdy * f
      }
      const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (sp > 0.5) { s.vx = (s.vx / sp) * 0.5; s.vy = (s.vy / sp) * 0.5 }
      s.vx += (Math.random() - 0.5) * 0.005
      s.vy += (Math.random() - 0.5) * 0.005
      s.x += s.vx
      s.y += s.vy
      if (s.x < 0) s.x += W
      if (s.x > W) s.x -= W
      if (s.y < 0) s.y += H
      if (s.y > H) s.y -= H
    }

    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j]
        if (!a || !b) continue
        const dx = a.x - b.x, dy = a.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.22
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
          grad.addColorStop(0, `rgba(${a.color[0]},${a.color[1]},${a.color[2]},${alpha})`)
          grad.addColorStop(1, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${alpha})`)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = grad
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    for (const s of stars) {
      const dx = s.x - mouse.x, dy = s.y - mouse.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 160) {
        const alpha = (1 - d / 160) * 0.45
        const grad = ctx.createLinearGradient(s.x, s.y, mouse.x, mouse.y)
        grad.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`)
        grad.addColorStop(1, `rgba(251,191,36,${alpha * 0.8})`)
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
    }

    for (const s of stars) {
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
      grd.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0.5)`)
      grd.addColorStop(1, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0)`)
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fill()
    }

    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

function handleMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function handleMouseLeave() {
  mouse.x = -2000
  mouse.y = -2000
}

onMounted(() => {
  initStarfield()
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="layout" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <!-- Starfield canvas — fixed, covers full viewport -->
    <canvas ref="canvasRef" class="starfield-canvas" />

    <!-- Blur glass header -->
    <header class="header">
      <div class="container header-inner">
        <a href="/" class="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="7" fill="var(--color-primary)" />
            <path d="M8 20L14 8L20 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 16H18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">Axiqra</span>
        </a>

        <nav class="nav">
          <a href="/" class="nav-link">{{ t('nav.home') }}</a>
          <a v-if="isLoggedIn" href="/dashboard" class="nav-link">{{ t('nav.dashboard') }}</a>
          <a href="/public-cases" class="nav-link">{{ t('nav.publicCases') }}</a>
          <a href="/tool-models" class="nav-link">{{ t('nav.leaderboard') }}</a>
        </nav>

        <div class="header-actions">
          <!-- Theme toggle -->
          <button
            class="icon-btn"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="themeStore.toggle()"
          >
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>

          <!-- Locale toggle -->
          <button class="lang-btn" @click="toggleLocale">
            {{ locale === 'en' ? '中文' : 'EN' }}
          </button>

          <!-- Auth -->
          <template v-if="isLoggedIn">
            <div class="user-menu">
              <button class="user-btn" @click="userMenuOpen = !userMenuOpen">
                <img
                  :src="authStore.getAvatarUrl()"
                  alt="avatar"
                  class="user-avatar-img"
                >
                <span class="user-name">{{ authStore.user?.username || 'User' }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div v-if="userMenuOpen" class="user-dropdown">
                <a href="/profile" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ t('nav.profile') || 'Profile' }}
                </a>
                <a href="/settings" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  {{ t('nav.settings') || 'Settings' }}
                </a>
                <hr class="dropdown-divider">
                <button class="dropdown-item" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {{ t('nav.logout') }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <a href="/login" class="btn btn-ghost">{{ t('nav.login') }}</a>
            <a href="/register" class="btn btn-primary">{{ t('nav.register') }}</a>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <span class="footer-brand">Axiqra</span>
        <span class="footer-copy">{{ t('app.tagline') }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Starfield — fixed, covers entire viewport */
.starfield-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  height: var(--header-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.8;
  text-decoration: none;
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex: 1;
}

.nav-link {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  padding: var(--space-1) 0;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.nav-link:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.nav-link:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  background: transparent;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.lang-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  letter-spacing: 0.05em;
  transition: all var(--transition-fast);
}

.lang-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.btn-ghost {
  color: var(--color-text-secondary);
  background: transparent;
}

.btn-ghost:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  text-decoration: none;
}

.btn-primary {
  color: var(--color-text-inverse);
  background: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  text-decoration: none;
  box-shadow: var(--shadow-glow);
}

.main {
  position: relative;
  z-index: 1;
  flex: 1;
}

.footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.footer-brand {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.footer-copy {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.user-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.user-avatar,
.user-avatar-img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: var(--text-xs);
  font-weight: 700;
}

.user-avatar-img {
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 180px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2);
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: none;
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  text-decoration: none;
}

.dropdown-divider {
  margin: var(--space-2) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}
</style>
