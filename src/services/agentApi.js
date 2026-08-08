import { apiRequest } from './apiClient'

export const AgentWorkspaceService = {
  /**
   * Fires the interactive chat processing loop payload downstream to the FastAPI app.
   */
  processInteractiveChatStep: async (payload) => {
    return await apiRequest('/api/prd-generator/interactive-chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  /**
   * Runs an atomic GET request targeting the background job tracking dictionary arrays.
   */
  checkBackgroundJobStatus: async (jobId) => {
    return await apiRequest(`/api/prd-generator/jobs/${jobId}`, {
      method: 'GET'
    })
  },

  /**
   * Alias: get the status of a background compilation job by ID.
   */
  getJobStatus: async (jobId) => {
    return await apiRequest(`/api/prd-generator/jobs/${jobId}`, {
      method: 'GET'
    })
  }
}