import { apiRequest, API_BASE_URL, getAccessToken } from './apiClient'

export const CanvasApi = {
  getCanvas: async (projectId) => {
    return await apiRequest(`/api/canvases?project_id=${projectId}`, {
      method: 'GET'
    })
  },

  createCanvas: async (payload) => {
    return await apiRequest('/api/canvases', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateCanvas: async (projectId, payload) => {
    return await apiRequest(`/api/canvases?project_id=${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  generateCanvas: async (projectId, documentId) => {
    return await apiRequest(`/api/canvases/generate?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, document_id: documentId })
    })
  },

  generateCanvasStream: async (projectId, documentId, { onPage, onComplete, onError }) => {
    const token = getAccessToken()
    const url = `${API_BASE_URL}/api/canvases/generate-stream?project_id=${projectId}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ project_id: projectId, document_id: documentId })
      })

      if (!response.ok) {
        const err = new Error(`Stream failed (${response.status})`)
        onError?.(err)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completed = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          const lines = event.split('\n')
          let eventType = ''
          let dataLines = []

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              dataLines.push(line.slice(6))
            }
          }

          if (dataLines.length === 0) continue

          const rawData = dataLines.join('\n')
          try {
            const parsed = JSON.parse(rawData)
            if (eventType === 'page') {
              onPage?.(parsed.page, parsed.index, parsed.total)
            } else if (eventType === 'complete') {
              completed = true
              onComplete?.(parsed.total, parsed.edges)
            }
          } catch {}
        }
      }

      if (!completed) onComplete?.(0, [])
    } catch (err) {
      onError?.(err)
    }
  }
}
