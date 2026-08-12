import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function getTroubleshootingArticles(orgId, { q = '', category = '' } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const query = params.toString()
  return apiRequest(`/api/orgs/me/troubleshooting${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}
