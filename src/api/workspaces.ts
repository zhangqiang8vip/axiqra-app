import apiClient from './client'
import type { ApiResponse, Workspace, CreateWorkspaceRequest } from '@/types'

export interface WorkspaceMember {
  memberId: number
  userId: number
  username: string
  nickname?: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'inactive'
  joinedAt: string
}

export const workspaceApi = {
  list: async (): Promise<Workspace[]> => {
    const response = await apiClient.get<ApiResponse<{ records: Workspace[] }>>('/workspaces')
    // 兼容两种格式：PageResponse.records 或直接数组
    const data = response.data.data
    if (Array.isArray(data)) {
      return data
    }
    return data?.records || []
  },

  getById: async (id: number): Promise<Workspace> => {
    const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`)
    return response.data.data
  },

  create: async (data: CreateWorkspaceRequest): Promise<Workspace> => {
    const response = await apiClient.post<ApiResponse<Workspace>>('/workspaces', data)
    return response.data.data
  },

  update: async (id: number, data: Partial<Workspace>): Promise<Workspace> => {
    const response = await apiClient.put<ApiResponse<Workspace>>(`/workspaces/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${id}`)
  },

  // 成员管理
  getMembers: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const response = await apiClient.get<ApiResponse<{ records: WorkspaceMember[] }>>(
      `/workspaces/${workspaceId}/members`
    )
    const data = response.data.data
    return Array.isArray(data) ? data : (data?.records || [])
  },

  addMember: async (workspaceId: number, userId: number, role: string = 'member'): Promise<WorkspaceMember> => {
    const response = await apiClient.post<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members`,
      null,
      { params: { userId, role } }
    )
    return response.data.data
  },

  updateMemberRole: async (workspaceId: number, memberId: number, role: string): Promise<void> => {
    await apiClient.put(`/workspaces/${workspaceId}/members`, { memberId, role })
  },

  removeMember: async (workspaceId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`)
  },

  // 邀请成员（通过用户名）
  inviteByUsername: async (workspaceId: number, username: string, role: string = 'member'): Promise<WorkspaceMember> => {
    // 先查询用户 ID
    const userResponse = await apiClient.get<ApiResponse<{ id: number }[]>>('/users/search', {
      params: { username }
    })
    const users = userResponse.data.data
    if (!users || users.length === 0 || !users[0]) {
      throw new Error('用户不存在')
    }
    const targetUser = users[0]
    return workspaceApi.addMember(workspaceId, targetUser.id, role)
  },
}

export default workspaceApi
