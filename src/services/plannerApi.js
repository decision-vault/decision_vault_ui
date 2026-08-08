import { apiRequest } from './apiClient'

export const PlannerApi = {
  generateProjectPlan: async (projectId, documentId) => {
    return await apiRequest('/api/prd-planner/generate-plan', {
      method: 'POST',
      headers: { 'x-project-id': projectId },
      body: JSON.stringify({
        project_id: projectId,
        document_id: documentId
      })
    })
  },

  generateWorkflow: async (projectId) => {
    return await apiRequest(`/api/projects/${projectId}/workflow/generate`, {
      method: 'POST',
      headers: { 'x-project-id': projectId }
    })
  }
}
