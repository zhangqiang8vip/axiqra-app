import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EngineeringTracePackage } from '@/types'

export const useTraceStore = defineStore('trace', () => {
  const currentDraft = ref<Partial<EngineeringTracePackage> | null>(null)
  const isDirty = ref(false)

  const setCurrentDraft = (draft: Partial<EngineeringTracePackage> | null) => {
    currentDraft.value = draft
    isDirty.value = false
  }

  const updateDraft = (updates: Partial<EngineeringTracePackage>) => {
    if (currentDraft.value) {
      currentDraft.value = { ...currentDraft.value, ...updates }
      isDirty.value = true
    }
  }

  const clearDraft = () => {
    currentDraft.value = null
    isDirty.value = false
  }

  const markSaved = () => {
    isDirty.value = false
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('axiqra_trace_draft')
      if (stored) {
        currentDraft.value = JSON.parse(stored)
        isDirty.value = false
      }
    } catch {
      // ignore
    }
  }

  const saveToStorage = () => {
    if (currentDraft.value) {
      try {
        localStorage.setItem('axiqra_trace_draft', JSON.stringify(currentDraft.value))
      } catch {
        // ignore
      }
    }
  }

  const clearStorage = () => {
    localStorage.removeItem('axiqra_trace_draft')
  }

  return {
    currentDraft,
    isDirty,
    setCurrentDraft,
    updateDraft,
    clearDraft,
    markSaved,
    loadFromStorage,
    saveToStorage,
    clearStorage,
  }
})
