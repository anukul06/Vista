const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

// In-memory only — never persisted to localStorage, so an XSS payload can't
// read it off disk. The refresh token lives in an httpOnly cookie the server
// sets; this module silently exchanges it for a new access token on 401s.
let accessToken = null
let onUnauthorized = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function onSessionExpired(handler) {
  onUnauthorized = handler
}

async function request(path, { method = 'GET', body, skipAuth = false, isRetry = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (!skipAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => null)

  if (res.status === 401 && !skipAuth && !isRetry) {
    const refreshed = await tryRefresh()
    if (refreshed) return request(path, { method, body, skipAuth, isRetry: true })
    onUnauthorized?.()
  }

  if (!res.ok || !json?.success) {
    const message = json?.error?.message ?? `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.details = json?.error?.details
    throw error
  }

  return json.data
}

let refreshPromise = null

async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = request('/auth/refresh', { method: 'POST', skipAuth: true })
      .then((data) => {
        setAccessToken(data.accessToken)
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  refreshSession: tryRefresh,
}
