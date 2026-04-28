'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'mis_user_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with null to prevent hydration mismatch
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Load user from localStorage after mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    // Verify session validity only after initialization and if user exists
    if (!initialized || !user) return
    
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem(STORAGE_KEY)
          setUser(null)
        }
      })
      .catch(() => {
        // Keep the session on error
      })
  }, [initialized, user?.id])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.success && data.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch {
      return { success: false, error: 'An error occurred' }
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
