import { apiRequest } from './apiClient'

export const WorkflowApi = {
  getWorkflow: async (projectId) => {
    return await apiRequest(`/api/workflows?project_id=${projectId}`, {
      method: 'GET'
    })
  },

  createWorkflow: async (payload) => {
    return await apiRequest('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateWorkflow: async (projectId, payload) => {
    return await apiRequest(`/api/workflows?project_id=${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }
}
