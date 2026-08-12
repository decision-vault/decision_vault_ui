import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function submitFeedback(orgId, payload) {
  return apiRequest('/api/orgs/me/feedback', {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function listFeedback(orgId) {
  return apiRequest('/api/orgs/me/feedback', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function updateFeedback(orgId, feedbackId, payload) {
  return apiRequest(`/api/orgs/me/feedback/${encodeURIComponent(feedbackId)}`, {
    method: 'PATCH',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function withdrawFeedback(orgId, feedbackId) {
  return apiRequest(`/api/orgs/me/feedback/${encodeURIComponent(feedbackId)}`, {
    method: 'DELETE',
    headers: tenantHeaders(orgId),
  })
}
