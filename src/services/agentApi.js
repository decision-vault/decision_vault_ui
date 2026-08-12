import { apiRequest, API_BASE_URL } from './apiClient'

export const AgentWorkspaceService = {
  /**
   * Fires the interactive chat processing loop payload downstream to the FastAPI app.
   */
  processInteractiveChatStep: async (payload, orgId) => {
    return await apiRequest('/api/prd-generator/interactive-chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: orgId ? { 'x-tenant-id': orgId } : undefined
    })
  },

  /**
   * Runs an atomic GET request targeting the background job tracking dictionary arrays.
   */
  checkBackgroundJobStatus: async (jobId) => {
    return await apiRequest(`/api/prd-generator/jobs/${jobId}`, {
      method: 'GET'
    })
  },

  /**
   * Alias: get the status of a background compilation job by ID.
   */
  getJobStatus: async (jobId) => {
    return await apiRequest(`/api/prd-generator/jobs/${jobId}`, {
      method: 'GET'
    })
  },

  /**
   * Paginated chat history for a document. Page 1 = newest entries; older
   * pages are returned in chronological order. `has_more` indicates whether
   * older entries exist. Entries include `is_doc_snapshot` and
   * `saved_snapshot_body` so each generated document can be reopened.
   */
  getDocumentChatHistory: async (documentId, page = 1, pageSize = 8) => {
    return await apiRequest(`/api/prd-generator/documents/${documentId}/chat?page=${page}&page_size=${pageSize}`, {
      method: 'GET'
    })
  },

  /**
   * Opens an SSE stream tailing a background job's live status in real time.
   * Structured execution events are emitted as the agent produces them:
   *   execution.started -> { execution_id }
   *   plan              -> { execution_id, steps: [{ id, title, description }] }
   *   step.started      -> { execution_id, step_id, title, description }
   *   step.progress     -> { execution_id, step_id, status }
   *   step.completed    -> { execution_id, step_id, title, result }
   *   step.failed       -> { execution_id, step_id, title, message }
   *   ai_response       -> { execution_id, content }
   *   execution.completed -> { execution_id }
   *   execution.failed  -> { execution_id, message }
   * Legacy frames (status / result / error / done) remain for the polling UI.
   * Returns the EventSource; the caller closes it when finished.
   */
  streamInteractiveChatJob: (jobId, {
    onStatus,
    onResult,
    onError,
    onDone,
    onExecutionStarted,
    onPlan,
    onStepStarted,
    onStepProgress,
    onStepCompleted,
    onStepFailed,
    onAiResponse,
    onExecutionCompleted,
    onExecutionFailed
  } = {}) => {
    const source = new EventSource(`${API_BASE_URL}/api/prd-generator/jobs/${jobId}/stream`)
    const parseData = (raw, fallback = {}) => {
      try { return JSON.parse(raw) } catch { return fallback }
    }
    source.addEventListener('status', (e) => onStatus?.(parseData(e.data)))
    source.addEventListener('result', (e) => onResult?.(parseData(e.data)))
    source.addEventListener('error', (e) => onError?.(parseData(e.data, { message: 'Agent stream error' })))
    source.addEventListener('done', () => onDone?.())
    source.addEventListener('execution.started', (e) => onExecutionStarted?.(parseData(e.data)))
    source.addEventListener('plan', (e) => onPlan?.(parseData(e.data)))
    source.addEventListener('step.started', (e) => onStepStarted?.(parseData(e.data)))
    source.addEventListener('step.progress', (e) => onStepProgress?.(parseData(e.data)))
    source.addEventListener('step.completed', (e) => onStepCompleted?.(parseData(e.data)))
    source.addEventListener('step.failed', (e) => onStepFailed?.(parseData(e.data)))
    source.addEventListener('ai_response', (e) => onAiResponse?.(parseData(e.data)))
    source.addEventListener('execution.completed', (e) => onExecutionCompleted?.(parseData(e.data)))
    source.addEventListener('execution.failed', (e) => onExecutionFailed?.(parseData(e.data)))
    source.onerror = () => {
      // Connection-level failure (server restart, network drop). Polling
      // fallback on the page takes over; keep the source so callers can close it.
    }
    return source
  }
}