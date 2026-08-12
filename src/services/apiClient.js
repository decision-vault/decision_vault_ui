const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://decision-vault-api.vercel.app' // Default to localhost if not set
const NGROK_SKIP_WARNING = import.meta.env.VITE_NGROK_SKIP_BROWSER_WARNING || 'true'

export { API_BASE_URL }

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem('dv_access_token', token)
  } else {
    localStorage.removeItem('dv_access_token')
  }
}

export function getAccessToken() {
  return localStorage.getItem('dv_access_token')
}

export async function apiRequest(path, options = {}) {
  const doRequest = async () => {
    const token = getAccessToken()
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': NGROK_SKIP_WARNING,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  let response = await doRequest()

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      response = await doRequest()
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail || body)
    } catch {
      // keep fallback
    }
    const error = new Error(detail)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

export async function apiBlobRequest(path, options = {}) {
  const doRequest = async () => {
    const token = getAccessToken()
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': NGROK_SKIP_WARNING,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  let response = await doRequest()

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      response = await doRequest()
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail || body)
    } catch {
      // keep fallback
    }
    const error = new Error(detail)
    error.status = response.status
    throw error
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') || ''
  const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/)
  const filename = match?.[1] || 'download'
  return { blob, filename }
}

async function tryRefreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': NGROK_SKIP_WARNING,
      },
    })
    if (!response.ok) {
      setAccessToken(null)
      window.dispatchEvent(new Event('dv:auth-logout'))
      return false
    }
    const body = await response.json()
    if (body?.access_token) {
      setAccessToken(body.access_token)
      return true
    }
    return false
  } catch {
    setAccessToken(null)
    window.dispatchEvent(new Event('dv:auth-logout'))
    return false
  }
}
