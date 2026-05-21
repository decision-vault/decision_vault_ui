import { apiRequest } from './apiClient'

export function listOrgUsers(orgId) {
  return apiRequest('/api/orgs/me/users', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function updateOrgUser(orgId, userId, payload) {
  return apiRequest(`/api/orgs/me/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify(payload),
  })
}

export function deleteOrgUser(orgId, userId) {
  return apiRequest(`/api/orgs/me/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

