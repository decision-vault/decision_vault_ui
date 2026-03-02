import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function getOwnerDashboardSummary(orgId, projectId, days = 7) {
  const params = new URLSearchParams()
  params.set('days', String(days))
  return apiRequest(`/api/projects/${projectId}/dashboard/owner-summary?${params.toString()}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}
