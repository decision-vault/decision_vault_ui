import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function getUsageOverview(orgId, { period = 'current', projectId = '' } = {}) {
  const params = new URLSearchParams()
  params.set('period', period)
  if (projectId) params.set('project_id', projectId)
  return apiRequest(`/api/orgs/me/usage?${params.toString()}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}
