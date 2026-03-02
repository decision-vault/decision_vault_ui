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

export function listPersonalContacts(orgId, projectId) {
  return apiRequest(`/api/projects/${projectId}/messenger/personal/contacts`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function listPersonalChats(orgId, projectId) {
  return apiRequest(`/api/projects/${projectId}/messenger/personal/chats`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function createPersonalChat(orgId, projectId, payload) {
  return apiRequest(`/api/projects/${projectId}/messenger/personal/chats`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function listPersonalMessages(orgId, projectId, chatId, limit = 200) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  return apiRequest(`/api/projects/${projectId}/messenger/personal/chats/${chatId}/messages?${params.toString()}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function createPersonalMessage(orgId, projectId, chatId, payload) {
  return apiRequest(`/api/projects/${projectId}/messenger/personal/chats/${chatId}/messages`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}
