import { apiRequest } from './apiClient'

function tenantHeader(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function listProjectMembers(orgId, projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members`, {
    method: 'GET',
    headers: tenantHeader(orgId),
  })
}

export function createProjectInvite(orgId, projectId, payload) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/invites`, {
    method: 'POST',
    headers: tenantHeader(orgId),
    body: JSON.stringify(payload),
  })
}

export function listProjectInvites(orgId, projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/invites`, {
    method: 'GET',
    headers: tenantHeader(orgId),
  })
}

export function revokeProjectInvite(orgId, projectId, inviteId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/members/invites/${encodeURIComponent(inviteId)}/revoke`,
    { method: 'POST', headers: tenantHeader(orgId) }
  )
}

export function updateProjectMemberRole(orgId, projectId, userId, role) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: tenantHeader(orgId),
    body: JSON.stringify({ role }),
  })
}

export function removeProjectMember(orgId, projectId, userId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: tenantHeader(orgId),
  })
}

export function leaveProject(orgId, projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/members/me/leave`, {
    method: 'POST',
    headers: tenantHeader(orgId),
  })
}

export function acceptProjectInvite(token) {
  return apiRequest('/api/invites/project/accept', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function declineProjectInvite(token) {
  return apiRequest('/api/invites/project/decline', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}
