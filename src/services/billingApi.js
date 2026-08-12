import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function getBillingOverview(orgId) {
  return apiRequest('/api/orgs/me/billing', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function getBillingPlans(orgId) {
  return apiRequest('/api/orgs/me/billing/plans', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function listInvoices(orgId) {
  return apiRequest('/api/orgs/me/billing/invoices', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function getLicense(orgId) {
  return apiRequest('/api/orgs/me/license', {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function changePlan(orgId, payload) {
  return apiRequest('/api/orgs/me/billing/plan', {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function updateBilling(orgId, payload) {
  return apiRequest('/api/orgs/me/billing', {
    method: 'PATCH',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function addPaymentMethod(orgId, payload) {
  return apiRequest('/api/orgs/me/billing/payment-methods', {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload),
  })
}

export function removePaymentMethod(orgId, methodId) {
  return apiRequest(`/api/orgs/me/billing/payment-methods/${encodeURIComponent(methodId)}`, {
    method: 'DELETE',
    headers: tenantHeaders(orgId),
  })
}

export function redeemCredit(orgId, code) {
  return apiRequest('/api/orgs/me/billing/credit/redeem', {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify({ code }),
  })
}
