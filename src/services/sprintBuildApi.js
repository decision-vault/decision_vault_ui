import { apiRequest, getAccessToken } from './apiClient'

const API_BASE = 'http://127.0.0.1:8000'
const BASE = '/api/sprint-build'

export const SprintBuildApi = {
  startBuild: async (sprintId, projectId, tasks, prdContext = '', domainContext = {}, projectDir = '') => {
    return await apiRequest(`${BASE}/start`, {
      method: 'POST',
      body: JSON.stringify({
        sprint_id: sprintId,
        project_id: projectId,
        tasks,
        prd_context: prdContext,
        domain_context: domainContext,
        project_dir: projectDir,
      }),
    })
  },

  getBuildStatus: async (sprintId) => {
    return await apiRequest(`${BASE}/${sprintId}/status`)
  },

  getActiveBuild: async (projectId) => {
    return await apiRequest(`${BASE}/active/${projectId}`)
  },

  streamProgress: (sprintId, onEvent) => {
    const token = getAccessToken()
    const url = `${API_BASE}${BASE}/${sprintId}/progress`
    let closed = false
    let controller = null

    const run = async () => {
      try {
        controller = new AbortController()
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!resp.ok) {
          if (onEvent) onEvent({ type: 'error', message: `SSE HTTP ${resp.status}` })
          return
        }

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!closed) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const raw of events) {
            const dataLine = raw.split('\n').find(l => l.startsWith('data: '))
            if (!dataLine) continue
            const json = dataLine.slice(6)
            try {
              const data = JSON.parse(json)
              if (onEvent) onEvent(data)
            } catch { /* skip malformed */ }
          }
        }
      } catch (e) {
        if (!closed && onEvent) onEvent({ type: 'error', message: e.message || 'SSE connection lost' })
      }
    }

    run()

    return {
      close: () => {
        closed = true
        if (controller) controller.abort()
      }
    }
  },

  // ── Polling-based progress (replaces SSE) ────────────────────────────
  pollBuildProgress: (sprintId, { onEvent, onDone, onError, intervalMs = 2000 } = {}) => {
    let timer = null
    let lastActivityIdx = 0
    let lastOutputIdx = {}
    let closed = false

    const poll = async () => {
      if (closed) return
      try {
        const outputParam = encodeURIComponent(JSON.stringify(lastOutputIdx))
        const url = `${BASE}/${sprintId}/status?last_activity_idx=${lastActivityIdx}&last_output_idx=${outputParam}`
        const data = await apiRequest(url)

        if (data.status === 'not_found') {
          if (onError) onError('Build not found')
          return
        }

        // Emit new activity log entries
        for (const entry of (data.activity_log || [])) {
          if (onEvent) onEvent({ type: 'log', timestamp: entry.timestamp, role: entry.agent, task_id: entry.task_id, content: entry.message, log_type: entry.step })
        }

        // Emit new terminal output
        for (const [tid, outputs] of Object.entries(data.terminal_output || {})) {
          for (const line of outputs) {
            if (onEvent) onEvent({ type: 'terminal_output', timestamp: line.ts || line.timestamp, role: line.role, task_id: tid, output: line.output || line.content || '' })
          }
        }

        // Emit task updates for tasks that changed
        for (const [tid, task] of Object.entries(data.tasks || {})) {
          if (onEvent) onEvent({ type: 'task_update', task_id: tid, status: task.status, role: task.agent })
        }

        // Emit permission requests (we check the pending list)
        if (data.status === 'running') {
          try {
            const perms = await sprintBuildApi.getPendingPermissions()
            for (const p of (perms || [])) {
              if (p.sprint_id === sprintId) {
                if (onEvent) onEvent({ type: 'permission', ...p })
              }
            }
          } catch { /* ignore */ }
        }

        // Emit progress
        if (onEvent) onEvent({ type: 'progress', status: data.status, completed: data.completed_tasks, total: data.total_tasks, failed: data.failed_tasks, role_progress: data.role_progress })

        lastActivityIdx = data.new_activity_idx || lastActivityIdx
        lastOutputIdx = data.new_output_idx || lastOutputIdx

        if (data.status === 'completed' || data.status === 'completed_with_errors') {
          if (onDone) onDone(data)
          return
        }

        timer = setTimeout(poll, intervalMs)
      } catch (e) {
        if (!closed && onError) onError(e.message || 'Poll failed')
        if (!closed) timer = setTimeout(poll, intervalMs * 2)
      }
    }

    poll()

    return {
      close: () => {
        closed = true
        if (timer) clearTimeout(timer)
      }
    }
  },

  // Permission endpoints
  getPendingPermissions: async () => {
    return await apiRequest(`${BASE}/permissions/pending`)
  },

  approvePermission: async (sprintId, taskId) => {
    return await apiRequest(`${BASE}/permissions/approve`, {
      method: 'POST',
      body: JSON.stringify({ sprint_id: sprintId, task_id: taskId }),
    })
  },

  denyPermission: async (sprintId, taskId) => {
    return await apiRequest(`${BASE}/permissions/deny`, {
      method: 'POST',
      body: JSON.stringify({ sprint_id: sprintId, task_id: taskId }),
    })
  },
}
