const STORAGE_KEY = 'dv_active_prd_run'
const VISIBILITY_KEY = 'dv_prd_tracker_collapsed'

export function getActivePrdRun() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.runId || !parsed?.orgId || !parsed?.projectId) return null
    return parsed
  } catch {
    return null
  }
}

export function setActivePrdRun(payload) {
  const value = {
    runId: payload.runId,
    orgId: payload.orgId,
    projectId: payload.projectId,
    status: payload.status || 'queued',
    updatedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event('dv:prd-run-updated'))
}

export function clearActivePrdRun() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('dv:prd-run-updated'))
}

export function getPrdTrackerCollapsed() {
  try {
    const saved = localStorage.getItem(VISIBILITY_KEY)
    if (saved === null) return true
    return saved === '1'
  } catch {
    return true
  }
}

export function setPrdTrackerCollapsed(collapsed) {
  localStorage.setItem(VISIBILITY_KEY, collapsed ? '1' : '0')
}
