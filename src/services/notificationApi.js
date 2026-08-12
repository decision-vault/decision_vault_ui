import { apiRequest, API_BASE_URL, getAccessToken } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function listNotifications(orgId, params = {}) {
  const sp = new URLSearchParams()
  if (params.type) sp.set('type', params.type)
  if (params.status) sp.set('status', params.status)
  if (params.severity != null && params.severity !== '') sp.set('severity', params.severity)
  if (params.limit) sp.set('limit', params.limit)
  const q = sp.toString()
  return apiRequest(`/api/orgs/me/notifications${q ? `?${q}` : ''}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function getUnreadCount(orgId) {
  return apiRequest('/api/orgs/me/notifications/unread-count', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function markNotificationRead(orgId, notificationId) {
  return apiRequest(`/api/orgs/me/notifications/${encodeURIComponent(notificationId)}`, {
    method: 'PATCH',
    headers: tenantHeaders(orgId),
  })
}

export function markAllNotificationsRead(orgId) {
  return apiRequest('/api/orgs/me/notifications/read-all', {
    method: 'POST',
    headers: tenantHeaders(orgId),
  })
}

export function createNotification(orgId, payload) {
  return apiRequest('/api/orgs/me/notifications', {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function connectNotificationStream({ orgId, onNotification, onError }) {
  const wsBase = API_BASE_URL.replace(/^http/, 'ws')
  let ws = null
  let closed = false
  let retries = 0

  const connect = () => {
    if (closed) return
    const token = getAccessToken()
    const url = `${wsBase}/ws/notifications?token=${encodeURIComponent(token || '')}&tenant_id=${encodeURIComponent(orgId)}`
    ws = new WebSocket(url)

    ws.onopen = () => {
      retries = 0
    }

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        onNotification?.(notification)
      } catch {
        // ignore malformed frames
      }
    }

    ws.onerror = () => {
      onError?.()
      try { ws.close() } catch { /* noop */ }
    }

    ws.onclose = () => {
      if (closed) return
      retries += 1
      const delay = Math.min(1000 * 2 ** retries, 30000)
      setTimeout(connect, delay)
    }
  }

  connect()

  return () => {
    closed = true
    try { ws.close() } catch { /* noop */ }
  }
}
