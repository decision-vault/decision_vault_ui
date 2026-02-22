import { apiRequest } from './apiClient'

export function listProjects(orgId, search = '', status = 'all') {
  const params = new URLSearchParams()
  if (search?.trim()) params.set('q', search.trim())
  if (status && status !== 'all') params.set('status', status)
  const qs = params.toString()
  return apiRequest(`/api/projects${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function createProject(orgId, payload) {
  return apiRequest('/api/projects', {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify(payload),
  })
}

export function deleteProject(orgId, projectId) {
  return apiRequest(`/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function restoreProject(orgId, projectId) {
  return apiRequest(`/api/projects/${projectId}/restore`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}
