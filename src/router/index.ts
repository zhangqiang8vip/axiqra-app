import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/i18n'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      // 首页/落地页（公开）
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { titleKey: 'routes.home' },
      },

      // 公开内容（无需登录）
      {
        path: 'search',
        name: 'search',
        component: () => import('@/pages/SearchPage.vue'),
        meta: { titleKey: 'routes.search' },
      },
      {
        path: 'public-cases',
        name: 'public-cases',
        component: () => import('@/pages/PublicCasesPage.vue'),
        meta: { titleKey: 'routes.publicCases' },
      },
      {
        path: 'public-cases/:id',
        name: 'public-case-detail',
        component: () => import('@/pages/PublicCaseDetailPage.vue'),
        meta: { titleKey: 'routes.publicCaseDetail', requiresAuth: false },
      },
      {
        path: 'solutions',
        name: 'solutions',
        component: () => import('@/pages/SolutionsPage.vue'),
        meta: { titleKey: 'routes.solutions' },
      },
      {
        path: 'solutions/:id',
        name: 'solution-detail',
        component: () => import('@/pages/SolutionDetailPage.vue'),
        meta: { titleKey: 'routes.solutionDetail' },
      },
      {
        path: 'leaderboard',
        name: 'leaderboard',
        component: () => import('@/pages/LeaderboardPage.vue'),
        meta: { titleKey: 'routes.leaderboard' },
      },

      // 认证页面
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { titleKey: 'routes.login', guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
        meta: { titleKey: 'routes.register', guestOnly: true },
      },

      // 用户专属页面（需要登录）
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { titleKey: 'routes.dashboard', requiresAuth: true },
      },
      {
        path: 'workspace',
        name: 'workspace',
        component: () => import('@/pages/WorkspacePage.vue'),
        meta: { titleKey: 'routes.workspace', requiresAuth: true },
      },
      {
        path: 'contribution',
        name: 'contribution',
        component: () => import('@/pages/ContributionPage.vue'),
        meta: { titleKey: 'routes.contribution', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { titleKey: 'routes.profile', requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/SettingsPage.vue'),
        meta: { titleKey: 'routes.settings', requiresAuth: true },
      },

      // Trace 相关
      {
        path: 'traces',
        name: 'traces',
        component: () => import('@/pages/TraceListPage.vue'),
        meta: { titleKey: 'routes.traces', requiresAuth: true },
      },
      {
        path: 'traces/new',
        name: 'trace-new',
        component: () => import('@/pages/TraceNewPage.vue'),
        meta: { titleKey: 'routes.traceNew', requiresAuth: true },
      },
      {
        path: 'traces/:id',
        name: 'trace-detail',
        component: () => import('@/pages/TraceDetailPage.vue'),
        meta: { titleKey: 'routes.traceDetail', requiresAuth: true },
      },
      {
        path: 'traces/:id/confirm',
        name: 'trace-confirm',
        component: () => import('@/pages/TraceConfirmPage.vue'),
        meta: { titleKey: 'routes.traceConfirm', requiresAuth: true },
      },

      // 项目案例
      {
        path: 'project-cases',
        name: 'project-cases',
        component: () => import('@/pages/ProjectCasesPage.vue'),
        meta: { titleKey: 'routes.projectCases', requiresAuth: true },
      },
      {
        path: 'project-cases/:id',
        name: 'project-case-detail',
        component: () => import('@/pages/ProjectCaseDetailPage.vue'),
        meta: { titleKey: 'routes.projectCaseDetail', requiresAuth: true },
      },

      // Seed 相关
      {
        path: 'candidate-seeds/new',
        name: 'seed-new',
        component: () => import('@/pages/SeedNewPage.vue'),
        meta: { titleKey: 'routes.seedNew', requiresAuth: true },
      },
      {
        path: 'candidate-seeds/:id',
        name: 'seed-detail',
        component: () => import('@/pages/SeedDetailPage.vue'),
        meta: { titleKey: 'routes.seedDetail', requiresAuth: true },
      },

      // AI 接入
      {
        path: 'connect',
        name: 'connect',
        component: () => import('@/pages/ConnectPage.vue'),
        meta: { titleKey: 'routes.connect', requiresAuth: true },
      },
      {
        path: 'connect/sessions/:id',
        name: 'connect-session',
        component: () => import('@/pages/ConnectSessionPage.vue'),
        meta: { titleKey: 'routes.connectSession', requiresAuth: true },
      },

      // 审核
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('@/pages/ReviewsPage.vue'),
        meta: { titleKey: 'routes.reviews', requiresAuth: true },
      },

      // 企业功能
      {
        path: 'enterprise',
        name: 'enterprise',
        component: () => import('@/pages/EnterprisePage.vue'),
        meta: { titleKey: 'routes.enterprise', requiresAuth: true },
      },
      {
        path: 'certifications',
        name: 'certifications',
        component: () => import('@/pages/CertificationPage.vue'),
        meta: { titleKey: 'routes.certifications', requiresAuth: true },
      },
      {
        path: 'tool-models',
        name: 'tool-models',
        component: () => import('@/pages/ToolModelsPage.vue'),
        meta: { titleKey: 'routes.toolModels' },
      },

      // 设备认证
      {
        path: 'auth/device',
        name: 'device-verify',
        component: () => import('@/pages/DeviceVerifyPage.vue'),
        meta: { titleKey: 'routes.deviceAuth', requiresAuth: true },
      },

      // 管理后台
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/pages/AdminPage.vue'),
        meta: { titleKey: 'routes.admin', requiresAuth: true, requiresAdmin: true },
      },

      // 404
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/pages/NotFoundPage.vue'),
        meta: { titleKey: 'routes.notFound' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.token

  // 设置页面标题
  const titleKey = to.meta.titleKey as string | undefined
  const title = titleKey ? String(i18n.global.t(titleKey)) : undefined
  document.title = title ? `${title} - Axiqra` : 'Axiqra'

  // 路由守卫
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && isLoggedIn) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
