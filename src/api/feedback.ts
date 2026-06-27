import apiClient from './client'
import type { ApiResponse, Feedback, SubmitFeedbackRequest, PageResponse } from '@/types'

export const feedbackApi = {
  /**
   * Submit feedback for an invocation
   */
  submit: async (data: SubmitFeedbackRequest): Promise<Feedback> => {
    const response = await apiClient.post<ApiResponse<Feedback>>('/feedback', data)
    return response.data.data
  },

  /**
   * Get feedback for an invocation
   */
  getByInvocation: async (invocationId: number): Promise<Feedback[]> => {
    const response = await apiClient.get<ApiResponse<Feedback[]>>(`/feedback/by-invocation/${invocationId}`)
    return response.data.data
  },

  /**
   * Get user's feedback history
   */
  getMyFeedback: async (params?: {
    page?: number
    pageSize?: number
  }): Promise<PageResponse<Feedback>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Feedback>>>(
      '/feedback/my-feedback',
      { params }
    )
    return response.data.data
  },
}

export default feedbackApi
