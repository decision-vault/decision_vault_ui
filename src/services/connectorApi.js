import { apiRequest } from './apiClient'

export function listConnectors(orgId) {
  return apiRequest('/api/connectors/status', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function getConnectorStartUrl(orgId, provider) {
  return apiRequest(`/api/connectors/start-url/${provider}`, {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function disconnectConnector(orgId, provider) {
  return apiRequest(`/api/connectors/disconnect/${provider}`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function listSlackChannels(orgId) {
  return apiRequest('/api/slack/channels', {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function listSlackChannelMessages(orgId, channelId, limit = 50) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  return apiRequest(`/api/slack/channels/${channelId}/messages?${params.toString()}`, {
    method: 'GET',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
  })
}

export function postSlackChannelMessage(orgId, channelId, text) {
  return apiRequest(`/api/slack/channels/${channelId}/messages`, {
    method: 'POST',
    headers: orgId ? { 'x-tenant-id': orgId } : undefined,
    body: JSON.stringify({ text }),
  })
}
