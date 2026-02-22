import { apiRequest } from './apiClient'

export function createBillingCheckout(orgId, plan) {
  const origin = window.location.origin
  return apiRequest(`/api/orgs/${orgId}/billing/checkout`, {
    method: 'POST',
    body: JSON.stringify({
      plan,
      success_url: `${origin}/organizations?billing=success`,
      cancel_url: `${origin}/organizations/plans?billing=cancel`,
    }),
  })
}

