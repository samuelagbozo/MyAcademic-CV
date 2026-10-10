const configuredApiUrl = import.meta.env.VITE_API_URL
const API_BASE_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(/\/$/, '')

export async function apiRequest(path, { token, ...options } = {}) {
  if (!API_BASE_URL) {
    throw new Error('The resume server URL is not configured. Please contact support.')
  }
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the resume database API at ${API_BASE_URL}. Check that the Server app is running and that its CLIENT_URL allows this site.`, { cause: error })
    }
    throw error
  }
  if (response.status === 204) return null

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(result?.error || `Request failed with status ${response.status}.`)
    error.status = response.status
    throw error
  }

  return result
}
