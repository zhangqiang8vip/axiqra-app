import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

function generateRandomAvatar(): string {
  const seed = Math.random().toString(36).substring(2, 15)
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function loadStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('axiqra_user')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('axiqra_token'))
  const user = ref<User | null>(loadStoredUser())
  const currentWorkspaceId = ref<number | null>(
    parseInt(localStorage.getItem('axiqra_workspace_id') || '0') || null
  )

  const isLoggedIn = computed(() => !!token.value)

  const currentWorkspace = computed(() => {
    if (!user.value || !currentWorkspaceId.value) {
      return user.value?.workspaces?.[0] || null
    }
    return user.value.workspaces?.find((w) => w.id === currentWorkspaceId.value) || null
  })

  const hasScope = (scope: string): boolean => {
    return user.value?.scopes?.includes(scope) || false
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('axiqra_token', newToken)
  }

  const setUser = (userInfo: User) => {
    const finalUser: User = {
      ...userInfo,
      avatar: userInfo.avatar || generateRandomAvatar(),
    }
    user.value = finalUser
    localStorage.setItem('axiqra_user', JSON.stringify(finalUser))
  }

  const setCurrentWorkspace = (workspaceId: number | null) => {
    currentWorkspaceId.value = workspaceId
    if (workspaceId) {
      localStorage.setItem('axiqra_workspace_id', String(workspaceId))
    } else {
      localStorage.removeItem('axiqra_workspace_id')
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    currentWorkspaceId.value = null
    localStorage.removeItem('axiqra_token')
    localStorage.removeItem('axiqra_user')
    localStorage.removeItem('axiqra_workspace_id')
  }

  const getAvatarUrl = (): string => {
    return user.value?.avatar || generateRandomAvatar()
  }

  return {
    token,
    user,
    currentWorkspaceId,
    currentWorkspace,
    isLoggedIn,
    hasScope,
    setToken,
    setUser,
    setCurrentWorkspace,
    logout,
    getAvatarUrl,
  }
})
