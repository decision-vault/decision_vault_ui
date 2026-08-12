import { apiRequest } from './apiClient'

export const KnowledgeApi = {
  indexProject: async (orgId, projectId) => {
    return await apiRequest(`/api/projects/${projectId}/knowledge/index`, {
      method: 'POST',
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  },

  extractDecisions: async (orgId, projectId) => {
    return await apiRequest(`/api/projects/${projectId}/knowledge/decisions/extract`, {
      method: 'POST',
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  },

  search: async (orgId, projectId, q, topK = 4) => {
    const params = new URLSearchParams({ q })
    if (topK) params.set('top_k', String(topK))
    return await apiRequest(`/api/projects/${projectId}/knowledge/search?${params.toString()}`, {
      method: 'GET',
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  },

  listDecisions: async (orgId, projectId) => {
    return await apiRequest(`/api/projects/${projectId}/knowledge/decisions`, {
      method: 'GET',
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  }
}
