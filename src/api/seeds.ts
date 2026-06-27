import apiClient from './client'
import type { ApiResponse, CandidateSeed, CreateSeedRequest, PageResponse } from '@/types'

export const seedApi = {
  /**
   * Get candidate seed by ID
   */
  getById: async (id: number): Promise<CandidateSeed> => {
    const response = await apiClient.get<ApiResponse<CandidateSeed>>(`/seeds/${id}`)
    return response.data.data
  },

  /**
   * List candidate seeds
   */
  list: async (params?: {
    page?: number
    pageSize?: number
    status?: string
    workspaceId?: number
  }): Promise<PageResponse<CandidateSeed>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<CandidateSeed>>>('/seeds', {
      params,
    })
    return response.data.data
  },

  /**
   * Create a new candidate seed (usually after empty search)
   */
  create: async (data: CreateSeedRequest): Promise<CandidateSeed> => {
    const response = await apiClient.post<ApiResponse<CandidateSeed>>('/seeds', data)
    return response.data.data
  },

  /**
   * Update a candidate seed
   */
  update: async (id: number, data: Partial<CandidateSeed>): Promise<CandidateSeed> => {
    const response = await apiClient.put<ApiResponse<CandidateSeed>>(`/seeds/${id}`, data)
    return response.data.data
  },

  /**
   * Claim a seed for resolution
   */
  claim: async (id: number): Promise<CandidateSeed> => {
    const response = await apiClient.post<ApiResponse<CandidateSeed>>(`/seeds/${id}/claim`)
    return response.data.data
  },

  /**
   * Close a seed with resolution
   */
  close: async (id: number, solutionId?: number): Promise<CandidateSeed> => {
    const response = await apiClient.post<ApiResponse<CandidateSeed>>(`/seeds/${id}/close`, {
      solutionId,
    })
    return response.data.data
  },
}

export default seedApi
