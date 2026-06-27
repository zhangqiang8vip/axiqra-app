import apiClient from './client'
import type { ApiResponse, PublicCase, PageResponse } from '@/types'

export const publicCaseApi = {
  /**
   * Get public case by ID
   */
  getById: async (id: number): Promise<PublicCase> => {
    const response = await apiClient.get<ApiResponse<PublicCase>>(`/public-cases/${id}`)
    return response.data.data
  },

  /**
   * List public cases with filters
   */
  list: async (params?: {
    page?: number
    pageSize?: number
    techStack?: string
    riskLevel?: string
    verificationLevel?: string
  }): Promise<PageResponse<PublicCase>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<PublicCase>>>('/public-cases', {
      params,
    })
    return response.data.data
  },

  /**
   * Submit learning feedback for a public case
   */
  submitFeedback: async (
    id: number,
    feedback: { type: 'helpful' | 'correction' | '看不懂' }
  ): Promise<void> => {
    await apiClient.post(`/public-cases/${id}/feedback`, feedback)
  },
}

export default publicCaseApi
