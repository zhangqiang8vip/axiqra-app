import apiClient from './client'
import type {
  ApiResponse,
  SearchRequest,
  SearchResult,
  PageResponse,
} from '@/types'

export const searchApi = {
  /**
   * Search for solutions, public cases, project cases, and candidate seeds
   * Uses POST /api/search/before-act with request body
   */
  search: async (params: SearchRequest): Promise<PageResponse<SearchResult>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<SearchResult>>>('/search/before-act', {
      query: params.query,
      workspaceId: params.workspaceId,
      techStack: params.techStack,
      domain: params.domain,
      riskLevel: params.riskLevel,
      verificationLevel: params.verificationLevel,
      resultType: params.resultType,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })
    return response.data.data
  },

  /**
   * Get search suggestions based on partial query
   */
  suggest: async (query: string): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/search/suggest', {
      params: { query },
    })
    return response.data.data
  },

  /**
   * Search public solutions (no authentication required)
   */
  searchPublic: async (params: Partial<SearchRequest>): Promise<PageResponse<SearchResult>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<SearchResult>>>('/search/public', {
      query: params.query,
      techStack: params.techStack,
      domain: params.domain,
      verificationLevel: params.verificationLevel,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })
    return response.data.data
  },
}

export default searchApi
