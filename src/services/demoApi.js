import { apiRequest } from './apiClient'

export function submitDemoRequest(payload) {
  return apiRequest('/api/demo/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

