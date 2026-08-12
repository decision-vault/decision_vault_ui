//  Fixed to match your native custom fetch request wrapper
import { apiRequest } from './apiClient' 

export const DocsManagementService = {
  /**
   * Fetches full structural workspace spaces including their internal 
   * nested document arrays to hydrate the sidebar tree layout.
   */
  getAllWorkspaces: async (orgId) => {
    return await apiRequest('/api/docs-management/workspaces', {
      method: 'GET',
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  },

  /**
   * Generates a pristine, standalone workspace directory node.
   * @param {Object} payload - { name: string }
   */
  createWorkspace: async (payload) => {
    return await apiRequest('/api/docs-management/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  /**
   * Permanently purges a workspace partition and its entire document ecosystem.
   * @param {string} workspaceId 
   */
  deleteWorkspace: async (workspaceId) => {
    return await apiRequest(`/api/docs-management/workspaces/${workspaceId}`, {
      method: 'DELETE'
    })
  },

  /**
   * Creates a new blank document entry within a specific workspace boundary parent.
   * @param {string} workspaceId 
   * @param {Object} payload - { title: string, body: string }
   */
  createDocument: async (workspaceId, payload) => {
    return await apiRequest(`/api/docs-management/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  /**
   * Handles immediate character streaming sync updates from the rich text editor,
   * patching either title fields or live rich text body content strings.
   * @param {string} documentId 
   * @param {Object} payload - { title?: string, body?: string }
   */
  syncDocumentContent: async (documentId, payload) => {
    return await apiRequest(`/api/docs-management/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  },

  /**
   * Permanently deletes a selected document record.
   * @param {string} documentId 
   */
  deleteDocument: async (documentId) => {
    return await apiRequest(`/api/docs-management/documents/${documentId}`, {
      method: 'DELETE'
    })
  }
}