import { apiRequest } from './apiClient'

export function signup(payload) {
  return apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refresh() {
  return apiRequest('/api/auth/refresh', {
    method: 'POST',
  })
}

export function logout() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  })
}

export function getSession() {
  return apiRequest('/api/auth/session', {
    method: 'GET',
  })
}
