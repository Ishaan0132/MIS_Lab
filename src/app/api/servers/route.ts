import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const servers = await db.server.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(servers)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, region, status, playerCount, maxPlayers, cpuUsage, memoryUsage } = body

    if (!name || !region) {
      return NextResponse.json({ error: 'Name and region are required' }, { status: 400 })
    }

    const server = await db.server.create({
      data: {
        name,
        region,
        status: status || 'ONLINE',
        playerCount: playerCount || 0,
        maxPlayers: maxPlayers || 1000,
        cpuUsage: cpuUsage || 0,
        memoryUsage: memoryUsage || 0,
        lastPing: new Date()
      }
    })

    return NextResponse.json(server, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
