import apiClient from './client'
import type {
  ApiResponse,
  ProjectCase,
  PageResponse,
  ReviewStatus,
} from '@/types'

export const projectCaseApi = {
  /**
   * Get project case by ID
   */
  getById: async (id: number): Promise<ProjectCase> => {
    const response = await apiClient.get<ApiResponse<ProjectCase>>(`/project-cases/${id}`)
    return response.data.data
  },

  /**
   * List user's project cases
   */
  list: async (params?: {
    page?: number
    pageSize?: number
    status?: string
    workspaceId?: number
  }): Promise<PageResponse<ProjectCase>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<ProjectCase>>>(
      '/project-cases',
      { params }
    )
    return response.data.data
  },

  /**
   * Create a project case from trace
   */
  createFromTrace: async (traceId: number): Promise<ProjectCase> => {
    const response = await apiClient.post<ApiResponse<ProjectCase>>('/project-cases/from-trace', {
      traceId,
    })
    return response.data.data
  },

  /**
   * Update a project case
   */
  update: async (id: number, data: Partial<ProjectCase>): Promise<ProjectCase> => {
    const response = await apiClient.put<ApiResponse<ProjectCase>>(`/project-cases/${id}`, data)
    return response.data.data
  },

  /**
   * Submit for review (publish with desensitization)
   */
  submitForReview: async (id: number): Promise<ReviewStatus> => {
    const response = await apiClient.post<ApiResponse<ReviewStatus>>(
      `/project-cases/${id}/submit-review`
    )
    return response.data.data
  },

  /**
   * Delete a project case
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/project-cases/${id}`)
  },
}

export default projectCaseApi
