import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function listChannels(orgId, projectId) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function createChannel(orgId, projectId, payload) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function listThreads(orgId, projectId, channelId) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels/${channelId}/threads`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function createThread(orgId, projectId, channelId, payload) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels/${channelId}/threads`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function listMessages(orgId, projectId, channelId, threadId = null) {
  const params = new URLSearchParams()
  if (threadId) params.set('thread_id', threadId)
  const qs = params.toString()
  return apiRequest(
    `/api/projects/${projectId}/messenger/channels/${channelId}/messages${qs ? `?${qs}` : ''}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function createMessage(orgId, projectId, channelId, payload) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels/${channelId}/messages`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function favoriteChannel(orgId, projectId, channelId) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels/${channelId}/favorite`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
  })
}

export function unfavoriteChannel(orgId, projectId, channelId) {
  return apiRequest(`/api/projects/${projectId}/messenger/channels/${channelId}/favorite`, {
    method: 'DELETE',
    headers: tenantHeaders(orgId),
  })
}
