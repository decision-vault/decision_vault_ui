import { apiRequest } from './apiClient'

export function getAccount() {
  return apiRequest('/api/account/me', { method: 'GET' })
}

export function updateAccount(payload) {
  return apiRequest('/api/account/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function changeAccountPassword(payload) {
  return apiRequest('/api/account/me/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
