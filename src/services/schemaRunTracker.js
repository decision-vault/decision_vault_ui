const STORAGE_KEY = 'dv_active_schema_generation'
const VISIBILITY_KEY = 'dv_schema_tracker_collapsed'

export function getActiveSchemaRun() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.orgId || !parsed?.projectId || !parsed?.intakeId || !parsed?.startedAt) return null
    return parsed
  } catch {
    return null
  }
}

export function setActiveSchemaRun(payload) {
  const value = {
    orgId: payload.orgId,
    projectId: payload.projectId,
    intakeId: payload.intakeId,
    runId: payload.runId || '',
    startedAt: Number(payload.startedAt) || Date.now(),
    status: payload.status || 'running',
    message: payload.message || '',
    updatedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event('dv:schema-run-updated'))
}

export function clearActiveSchemaRun() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('dv:schema-run-updated'))
}

export function getSchemaTrackerCollapsed() {
  try {
    const saved = localStorage.getItem(VISIBILITY_KEY)
    if (saved === null) return true
    return saved === '1'
  } catch {
    return true
  }
}

export function setSchemaTrackerCollapsed(collapsed) {
  localStorage.setItem(VISIBILITY_KEY, collapsed ? '1' : '0')
}

