import { NextRequest } from 'next/server'
import { db } from './db'

// Session utilities for the MIS system
// Gets the current user from the auth token in cookies/headers

export async function getCurrentUser(request?: NextRequest) {
  try {
    // Try to get user from Authorization header (client-side auth)
    let authHeader: string | null = null
    
    if (request) {
      authHeader = request.headers.get('Authorization')
    }
    
    // If no auth header, try to get from cookies or return default admin for demo
    if (!authHeader) {
      // For demo purposes, return the admin user if no auth is provided
      const adminUser = await db.user.findUnique({
        where: { email: 'admin@videogame.com' }
      })
      
      if (adminUser) {
        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      }
      
      return null
    }
    
    // Parse the auth token (base64 encoded JSON)
    try {
      const token = authHeader.replace('Bearer ', '')
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      const user = await db.user.findUnique({
        where: { id: decoded.id }
      })
      
      if (!user) return null
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    } catch {
      return null
    }
  } catch {
    return null
  }
}

export async function requireAuth(request?: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(roles: string[], request?: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !roles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}