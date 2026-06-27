import apiClient from './client'
import type {
  ApiResponse,
  Solution,
  PageResponse,
  SubmitFeedbackRequest,
  FeedbackResult,
} from '@/types'

export const solutionApi = {
  /**
   * Get solution by ID
   */
  getById: async (id: number): Promise<Solution> => {
    const response = await apiClient.get<ApiResponse<Solution>>(`/solutions/${id}`)
    return response.data.data
  },

  /**
   * List solutions with filters
   */
  list: async (params?: {
    page?: number
    pageSize?: number
    techStack?: string
    riskLevel?: string
    status?: string
  }): Promise<PageResponse<Solution>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Solution>>>('/solutions', {
      params,
    })
    return response.data.data
  },

  /**
   * Submit feedback for a solution
   */
  submitFeedback: async (id: number, feedback: SubmitFeedbackRequest): Promise<void> => {
    await apiClient.post(`/solutions/${id}/feedback`, feedback)
  },

  /**
   * Get feedback statistics for a solution
   */
  getFeedbackStats: async (
    id: number
  ): Promise<Record<FeedbackResult, { count: number; percentage: number }>> => {
    const response = await apiClient.get<
      ApiResponse<Record<FeedbackResult, { count: number; percentage: number }>>
    >(`/solutions/${id}/feedback-stats`)
    return response.data.data
  },

  /**
   * Get invocation history for a solution
   */
  getInvocations: async (
    id: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<PageResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<unknown>>>(
      `/solutions/${id}/invocations`,
      { params }
    )
    return response.data.data
  },
}

export default solutionApi
