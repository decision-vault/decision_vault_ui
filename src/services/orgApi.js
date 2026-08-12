import { apiRequest } from './apiClient'

export async function listOrganizations(search = '') {
  const q = search?.trim()
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  try {
    // Regular users get their owned orgs; superAdmin gets all. Each org carries its plan.
    const orgs = await apiRequest(`/api/orgs${query}`, { method: 'GET' })
    return { orgs, canCreate: true }
  } catch (listError) {
    try {
      // Fallback: single-tenant flows may not expose the list endpoint.
      const me = await apiRequest('/api/orgs/me', { method: 'GET' })
      const orgs = q ? [me].filter((org) => org.name.toLowerCase().includes(q.toLowerCase())) : [me]
      return { orgs, canCreate: false }
    } catch (meError) {
      if (listError?.status === 403 || meError?.status === 403) {
        throw new Error('Forbidden')
      }
      throw meError
    }
  }
}

export function createOrganization(payload) {
  return apiRequest('/api/orgs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getOrganization(orgId) {
  return apiRequest('/api/orgs/me', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function updateOrganization(orgId, payload) {
  return apiRequest('/api/orgs/me', {
    method: 'PATCH',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify(payload),
  })
}

export function deleteOrganization(orgId) {
  return apiRequest('/api/orgs/me', {
    method: 'DELETE',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function restoreOrganization(orgId) {
  return apiRequest('/api/orgs/me/restore', {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function listOrgInvites(orgId, { includeExpired = false } = {}) {
  const qs = includeExpired ? '?include_expired=true' : ''
  return apiRequest(`/api/orgs/me/invites${qs}`, {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function createOrgInvite(orgId, payload) {
  return apiRequest('/api/orgs/me/invites', {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify(payload),
  })
}

export function acceptOrgInvite(payload) {
  return apiRequest('/api/orgs/invites/accept', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function reinviteOrgInvite(orgId, inviteId) {
  return apiRequest(`/api/orgs/me/invites/${encodeURIComponent(inviteId)}/reinvite`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}
