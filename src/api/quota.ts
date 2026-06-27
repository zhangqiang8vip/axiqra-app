import apiClient from './client'
import type { ApiResponse, Quota } from '@/types'

export const quotaApi = {
  /**
   * Get current quota status
   */
  get: async (): Promise<Quota> => {
    const response = await apiClient.get<ApiResponse<Quota>>('/quota')
    return response.data.data
  },
}

export default quotaApi
