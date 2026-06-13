import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem('axiqra-theme') as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = ref<'light' | 'dark'>(savedTheme ?? (prefersDark ? 'dark' : 'light'))

  function applyTheme(t: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', t)
  }

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (t) => {
    applyTheme(t)
    localStorage.setItem('axiqra-theme', t)
  }, { immediate: true })

  return { theme, toggle }
})
