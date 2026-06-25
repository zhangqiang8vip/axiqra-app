import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/i18n'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { titleKey: 'routes.home' },
      },
      {
        path: 'auth/device',
        name: 'device-verify',
        component: () => import('@/pages/DeviceVerifyPage.vue'),
        meta: { titleKey: 'routes.deviceAuth', requiresAuth: true },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { titleKey: 'routes.dashboard', requiresAuth: true },
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
      {
        path: 'public-cases',
        name: 'public-cases',
        component: () => import('@/pages/PublicCasesPage.vue'),
        meta: { titleKey: 'routes.publicCases' },
      },
      {
        path: 'tool-models',
        name: 'tool-models',
        component: () => import('@/pages/ToolModelsPage.vue'),
        meta: { titleKey: 'routes.toolModels' },
      },
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
  const isLoggedIn = authStore.isLoggedIn()

  // 设置页面标题
  const titleKey = to.meta.titleKey as string | undefined
  const title = titleKey ? i18n.global.t(titleKey) : undefined
  document.title = title ? `${title} - Axiqra` : 'Axiqra'

  // 路由守卫
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && isLoggedIn) {
    // 只能游客访问，已登录则跳转首页
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
