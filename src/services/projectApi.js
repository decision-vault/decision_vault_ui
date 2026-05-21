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

export function listProjectCatalog(orgId) {
  return apiRequest('/api/projects/meta/catalog', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function requestProjectAccess(orgId, projectId) {
  return apiRequest(`/api/projects/access/projects/${encodeURIComponent(projectId)}/request`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function listMyProjectAccessRequests(orgId) {
  return apiRequest('/api/projects/access/my-requests', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function listProjectAccessRequests(orgId) {
  return apiRequest('/api/projects/access/requests', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function approveProjectAccessRequest(orgId, requestId) {
  return apiRequest(`/api/projects/access/requests/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function rejectProjectAccessRequest(orgId, requestId) {
  return apiRequest(`/api/projects/access/requests/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function inviteUserToProjectByEmail(orgId, projectId, payload) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/invites`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify(payload),
  })
}
