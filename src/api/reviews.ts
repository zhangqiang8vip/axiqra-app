import apiClient from './client'
import type {
  ApiResponse,
  Review,
  ReviewQueueItem,
  SubmitReviewRequest,
  PageResponse,
} from '@/types'

export const reviewApi = {
  /**
   * Get review queue
   */
  getQueue: async (params?: {
    page?: number
    pageSize?: number
    riskLevel?: string
  }): Promise<PageResponse<ReviewQueueItem>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ReviewQueueItem>>>(
      '/reviews/queue',
      { params }
    )
    return response.data.data
  },

  /**
   * Get review by ID
   */
  getById: async (id: number): Promise<Review> => {
    const response = await apiClient.get<ApiResponse<Review>>(`/reviews/${id}`)
    return response.data.data
  },

  /**
   * Get review by target
   */
  getByTarget: async (
    targetType: 'public_case' | 'solution' | 'project_case',
    targetId: number
  ): Promise<Review> => {
    const response = await apiClient.get<ApiResponse<Review>>('/reviews/by-target', {
      params: { targetType, targetId },
    })
    return response.data.data
  },

  /**
   * Submit a review decision
   */
  submit: async (data: SubmitReviewRequest): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', data)
    return response.data.data
  },

  /**
   * Get user's review history
   */
  getMyReviews: async (params?: {
    page?: number
    pageSize?: number
  }): Promise<PageResponse<Review>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Review>>>(
      '/reviews/my-reviews',
      { params }
    )
    return response.data.data
  },
}

export default reviewApi
