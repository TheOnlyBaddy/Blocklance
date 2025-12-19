// Lightweight placeholder auth hook to avoid import errors.
// Replace with real implementation when backend/auth is wired.
import { useCallback } from 'react'

export function useAuth() {
  const login = useCallback((user) => {
    try {
      // Optionally persist mock user for demo purposes
      if (user) {
        window.localStorage.setItem('blocklance_user', JSON.stringify(user))
      }
    } catch {}
  }, [])

  const logout = useCallback(() => {
    try { window.localStorage.removeItem('blocklance_user') } catch {}
  }, [])

  return { login, logout }
}
