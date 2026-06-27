import apiClient from './client'
import type {
  ApiResponse,
  EngineeringTracePackage,
  PageResponse,
} from '@/types'

export const traceApi = {
  /**
   * Get trace by ID
   */
  getById: async (id: number): Promise<EngineeringTracePackage> => {
    const response = await apiClient.get<ApiResponse<EngineeringTracePackage>>(`/traces/${id}`)
    return response.data.data
  },

  /**
   * List user's traces
   */
  list: async (params?: {
    page?: number
    pageSize?: number
    status?: string
    workspaceId?: number
  }): Promise<PageResponse<EngineeringTracePackage>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<EngineeringTracePackage>>>(
      '/traces',
      { params }
    )
    return response.data.data
  },

  /**
   * Create a new trace (draft)
   */
  create: async (trace: Partial<EngineeringTracePackage>): Promise<EngineeringTracePackage> => {
    const response = await apiClient.post<ApiResponse<EngineeringTracePackage>>('/traces', trace)
    return response.data.data
  },

  /**
   * Update a trace
   */
  update: async (
    id: number,
    trace: Partial<EngineeringTracePackage>
  ): Promise<EngineeringTracePackage> => {
    const response = await apiClient.put<ApiResponse<EngineeringTracePackage>>(
      `/traces/${id}`,
      trace
    )
    return response.data.data
  },

  /**
   * Confirm and submit a trace
   */
  confirm: async (id: number, confirmedTrace: EngineeringTracePackage): Promise<{ projectCaseId?: number }> => {
    const response = await apiClient.post<ApiResponse<{ projectCaseId?: number }>>(
      `/traces/${id}/confirm`,
      confirmedTrace
    )
    return response.data.data
  },

  /**
   * Delete a trace
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/traces/${id}`)
  },
}

export default traceApi
