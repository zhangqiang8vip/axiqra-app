import apiClient from './client'
import type {
  ApiResponse,
  ConnectSession,
  CreateConnectSessionRequest,
  DoctorResult,
} from '@/types'

export const connectApi = {
  /**
   * Create a new connect session
   */
  createSession: async (params: CreateConnectSessionRequest): Promise<ConnectSession> => {
    const response = await apiClient.post<ApiResponse<ConnectSession>>('/connect/sessions', params)
    return response.data.data
  },

  /**
   * Get connect session by ID
   */
  getSession: async (id: number): Promise<ConnectSession> => {
    const response = await apiClient.get<ApiResponse<ConnectSession>>(`/connect/sessions/${id}`)
    return response.data.data
  },

  /**
   * List user's connect sessions
   */
  listSessions: async (params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<{ list: ConnectSession[]; total: number }> => {
    const response = await apiClient.get<ApiResponse<{ list: ConnectSession[]; total: number }>>(
      '/connect/sessions',
      { params }
    )
    return response.data.data
  },

  /**
   * Run doctor check for a session
   */
  runDoctor: async (id: number): Promise<DoctorResult> => {
    const response = await apiClient.post<ApiResponse<DoctorResult>>(`/connect/sessions/${id}/doctor`)
    return response.data.data
  },

  /**
   * Revoke a connect session
   */
  revokeSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/connect/sessions/${id}`)
  },

  /**
   * Get installation instructions for a channel
   */
  getInstallInstructions: async (
    channel: 'cli' | 'mcp' | 'api',
    sessionId?: number
  ): Promise<{ instructions: string; example?: string }> => {
    const response = await apiClient.get<
      ApiResponse<{ instructions: string; example?: string }>
    >('/connect/install', {
      params: { channel, sessionId },
    })
    return response.data.data
  },
}

export default connectApi
