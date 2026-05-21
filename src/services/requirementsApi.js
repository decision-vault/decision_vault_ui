import { apiBlobRequest, apiRequest } from './apiClient'

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

export function chatRequirements(orgId, projectId, payload) {
  return apiRequest(`/api/requirements/chat?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload || {}),
  })
}

export function assistantProjectChat(orgId, projectId, intakeId, message) {
  return apiRequest(`/api/requirements/${encodeURIComponent(intakeId)}/assistant-chat?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify({ message }),
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

export function getRequirementsPrd(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/prd?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getDocById(orgId, projectId, kind, docId) {
  return apiRequest(
    `/api/docs/${encodeURIComponent(docId)}?project_id=${encodeURIComponent(projectId)}&kind=${encodeURIComponent(kind)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function startGenerationRun(orgId, projectId, payload) {
  return apiRequest(`/api/generation/runs?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
    body: JSON.stringify(payload || {}),
  })
}

export function getGenerationRunStatus(orgId, projectId, runId) {
  return apiRequest(`/api/generation/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function respondGenerationRunClarification(orgId, projectId, runId, payload) {
  return apiRequest(
    `/api/generation/runs/${encodeURIComponent(runId)}/clarification/respond?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload || {}),
    }
  )
}

export function getActiveGenerationRuns(orgId, projectId) {
  return apiRequest(`/api/generation/active?project_id=${encodeURIComponent(projectId)}`, {
    method: 'GET',
    headers: tenantHeaders(orgId),
  })
}

export function pauseGenerationRun(orgId, projectId, runId) {
  return apiRequest(`/api/generation/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
  })
}

export function resumeGenerationRun(orgId, projectId, runId) {
  return apiRequest(`/api/generation/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
  })
}

export function stopGenerationRun(orgId, projectId, runId) {
  return apiRequest(`/api/generation/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: tenantHeaders(orgId),
  })
}

export function generateSchemaFlow(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-schema-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function startSchemaFlowRun(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-schema-flow/run?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload || {}),
    }
  )
}

export function getSchemaFlowRunStatus(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/schema-flow/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function pauseSchemaFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/schema-flow/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function resumeSchemaFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/schema-flow/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function stopSchemaFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/schema-flow/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSchemaFlow(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/schema-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSchemaFlowVersions(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/schema-flow/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSchemaFlowVersion(orgId, projectId, intakeId, versionNumber) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/schema-flow/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function generateUsecaseFlow(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-usecase-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function startUsecaseFlowRun(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-usecase-flow/run?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload || {}),
    }
  )
}

export function getUsecaseFlowRunStatus(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/usecase-flow/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function pauseUsecaseFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/usecase-flow/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function resumeUsecaseFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/usecase-flow/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function stopUsecaseFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/usecase-flow/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getUsecaseFlow(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/usecase-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getUsecaseFlowVersions(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/usecase-flow/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getUsecaseFlowVersion(orgId, projectId, intakeId, versionNumber) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/usecase-flow/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function generateSequenceFlow(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-sequence-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function startSequenceFlowRun(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-sequence-flow/run?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload || {}),
    }
  )
}

export function getSequenceFlowRunStatus(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/sequence-flow/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function pauseSequenceFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/sequence-flow/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function resumeSequenceFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/sequence-flow/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function stopSequenceFlowRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/sequence-flow/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSequenceFlow(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/sequence-flow?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSequenceFlowVersions(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/sequence-flow/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getSequenceFlowVersion(orgId, projectId, intakeId, versionNumber) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/sequence-flow/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function generateArchitectureDiagram(orgId, projectId, intakeId, payload) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-architecture-diagram?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload || {}),
    }
  )
}

export function getArchitectureDiagram(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/architecture-diagram?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getArchitectureDiagramVersions(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/architecture-diagram/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getArchitectureDiagramVersion(orgId, projectId, intakeId, versionNumber) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/architecture-diagram/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
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

export function generateRequirementsSystemDesign(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-system-design?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getRequirementsSystemDesign(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/system-design?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getLatestRequirementsSystemDesign(orgId, projectId) {
  return apiRequest(
    `/api/requirements/latest/system-design?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getRequirementsSystemDesignVersions(orgId, projectId) {
  return apiRequest(
    `/api/requirements/system-design/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getRequirementsSystemDesignVersion(orgId, projectId, versionNumber) {
  return apiRequest(
    `/api/requirements/system-design/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function startRequirementsSystemDesignRun(orgId, projectId, intakeId) {
  return apiRequest(
    `/api/requirements/${encodeURIComponent(intakeId)}/generate-system-design/run?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getRequirementsSystemDesignRunStatus(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/system-design/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function pauseRequirementsSystemDesignRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/system-design/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function resumeRequirementsSystemDesignRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/system-design/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function stopRequirementsSystemDesignRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/requirements/system-design/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`,
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

export function generateLlmPrdMultistep(orgId, projectId, payload) {
  return apiRequest(
    `/api/prd/generate-multistep?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function startLlmPrdRun(orgId, projectId, payload) {
  return apiRequest(
    `/api/prd/generate-multistep/run?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
      body: JSON.stringify(payload),
    }
  )
}

export function getLlmPrdRunStatus(orgId, projectId, runId) {
  return apiRequest(
    `/api/prd/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function pauseLlmPrdRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/prd/runs/${encodeURIComponent(runId)}/pause?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function resumeLlmPrdRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/prd/runs/${encodeURIComponent(runId)}/resume?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function stopLlmPrdRun(orgId, projectId, runId) {
  return apiRequest(
    `/api/prd/runs/${encodeURIComponent(runId)}/stop?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getLatestLlmPrd(orgId, projectId) {
  return apiRequest(
    `/api/prd/latest?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getLlmPrdVersions(orgId, projectId) {
  return apiRequest(
    `/api/prd/versions?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}

export function getLlmPrdVersion(orgId, projectId, versionNumber) {
  return apiRequest(
    `/api/prd/versions/${encodeURIComponent(versionNumber)}?project_id=${encodeURIComponent(projectId)}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
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

export function exportLlmPrd(orgId, projectId, type, versionNumber, docKind = 'prd') {
  const versionQuery = versionNumber ? `&version=${encodeURIComponent(versionNumber)}` : ''
  const docTypeQuery = docKind ? `&doc_type=${encodeURIComponent(String(docKind).toLowerCase())}` : ''
  return apiBlobRequest(
    `/api/prd/export?project_id=${encodeURIComponent(projectId)}&type=${encodeURIComponent(type)}${versionQuery}${docTypeQuery}`,
    {
      method: 'GET',
      headers: tenantHeaders(orgId),
    }
  )
}
