const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers })
  if (response.status === 204) return null

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(result?.error || `Request failed with status ${response.status}.`)
  }

  return result
}
