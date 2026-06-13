import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('axiqra_token'))
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = () => !!token.value

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('axiqra_token', newToken)
  }

  const setUser = (userInfo: UserInfo) => {
    user.value = userInfo
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('axiqra_token')
  }

  return { token, user, isLoggedIn, setToken, setUser, logout }
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
