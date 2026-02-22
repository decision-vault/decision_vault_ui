import { apiRequest } from './apiClient'

function tenantHeaders(orgId) {
  return orgId ? { 'x-tenant-id': orgId } : undefined
}

export function startRequirements(orgId, projectId, rawText) {
  return apiRequest(`/api/requirements/start?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify({ raw_text: rawText }),
  })
}

export function respondRequirements(orgId, projectId, intakeId, answers) {
  return apiRequest(`/api/requirements/respond?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify({ intake_id: intakeId, answers }),
  })
}

export function getRequirementsStatus(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getLatestRequirementsStatus(orgId, projectId) {
  return apiRequest(
    `/api/requirements/latest?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function generateRequirementsPrd(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-prd?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function generateLlmPrd(orgId, projectId, payload) {
  return apiRequest(
    `/api/prd/generate?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function respondLlmPrdClarification(orgId, projectId, payload) {
  return apiRequest(
    `/api/prd/clarification/respond?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}
