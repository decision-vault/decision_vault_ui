import { apiRequest } from './apiClient'

export async function listOrganizations(search = '') {
  const q = search?.trim()
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  try {
    // Most users are tenant-scoped (not superAdmin), so /me avoids noisy 403 logs.
    const me = await apiRequest('/api/orgs/me', { method: 'GET' })
    const orgs = q ? [me].filter((org) => org.name.toLowerCase().includes(q.toLowerCase())) : [me]
    return { orgs, canCreate: false }
  } catch (meError) {
    try {
      const orgs = await apiRequest(`/api/orgs${query}`, { method: 'GET' })
      return { orgs, canCreate: true }
    } catch (listError) {
      if (listError?.status === 403 || meError?.status === 403) {
        throw new Error('Forbidden')
      }
      throw listError
    }
  }
}

export function createOrganization(payload) {
  return apiRequest('/api/orgs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
