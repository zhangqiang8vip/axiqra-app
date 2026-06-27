import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SearchResult } from '@/types'

export interface SearchFilters {
  query: string
  techStack?: string
  domain?: string
  riskLevel?: string
  verificationLevel?: string
  resultType?: 'all' | 'solution' | 'public_case' | 'project_case' | 'candidate_seed'
}

export const useSearchStore = defineStore('search', () => {
  const filters = ref<SearchFilters>({ query: '', resultType: 'all' })
  const results = ref<SearchResult[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const recentlyViewed = ref<SearchResult[]>([])
  const MAX_RECENTLY_VIEWED = 10

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasResults = computed(() => results.value.length > 0)
  const hasMore = computed(() => page.value < totalPages.value)

  const setFilters = (newFilters: Partial<SearchFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
    page.value = 1
  }

  const setResults = (newResults: SearchResult[], newTotal: number) => {
    results.value = newResults
    total.value = newTotal
    error.value = null
  }

  const appendResults = (newResults: SearchResult[], newTotal: number) => {
    results.value = [...results.value, ...newResults]
    total.value = newTotal
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const nextPage = () => {
    if (hasMore.value) {
      page.value++
    }
  }

  const reset = () => {
    filters.value = { query: '', resultType: 'all' }
    results.value = []
    total.value = 0
    page.value = 1
    error.value = null
  }

  const addToRecentlyViewed = (result: SearchResult) => {
    const existing = recentlyViewed.value.findIndex((r) => r.id === result.id && r.type === result.type)
    if (existing !== -1) {
      recentlyViewed.value.splice(existing, 1)
    }
    recentlyViewed.value.unshift(result)
    if (recentlyViewed.value.length > MAX_RECENTLY_VIEWED) {
      recentlyViewed.value = recentlyViewed.value.slice(0, MAX_RECENTLY_VIEWED)
    }
    try {
      localStorage.setItem('axiqra_recently_viewed', JSON.stringify(recentlyViewed.value))
    } catch {
      // ignore storage errors
    }
  }

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem('axiqra_recently_viewed')
      if (stored) {
        recentlyViewed.value = JSON.parse(stored)
      }
    } catch {
      // ignore
    }
  }

  const clearRecentlyViewed = () => {
    recentlyViewed.value = []
    localStorage.removeItem('axiqra_recently_viewed')
  }

  return {
    filters,
    results,
    total,
    page,
    pageSize,
    loading,
    error,
    recentlyViewed,
    totalPages,
    hasResults,
    hasMore,
    setFilters,
    setResults,
    appendResults,
    setLoading,
    setError,
    nextPage,
    reset,
    addToRecentlyViewed,
    loadRecentlyViewed,
    clearRecentlyViewed,
  }
})
