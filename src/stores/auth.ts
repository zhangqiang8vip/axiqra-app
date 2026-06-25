import { defineStore } from 'pinia'
import { ref } from 'vue'

function generateRandomAvatar(): string {
  // DiceBear Adventurer style - truly random avatar
  const seed = Math.random().toString(36).substring(2, 15)
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function loadStoredUser(): UserInfo | null {
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
  const user = ref<UserInfo | null>(loadStoredUser())

  const isLoggedIn = () => !!token.value

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('axiqra_token', newToken)
  }

  const setUser = (userInfo: UserInfo) => {
    // Generate random avatar only if not provided by backend
    const finalUser: UserInfo = {
      ...userInfo,
      avatar: userInfo.avatar || generateRandomAvatar()
    }
    user.value = finalUser
    localStorage.setItem('axiqra_user', JSON.stringify(finalUser))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('axiqra_token')
    localStorage.removeItem('axiqra_user')
  }

  const getAvatarUrl = (): string => {
    return user.value?.avatar || generateRandomAvatar()
  }

  return { token, user, isLoggedIn, getAvatarUrl, setToken, setUser, logout }
})

export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  scopes: string[]
  workspaces: Workspace[]
}

export interface Workspace {
  id: string
  name: string
  type: 'personal' | 'team' | 'enterprise'
}
