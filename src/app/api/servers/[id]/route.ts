import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const server = await db.server.findUnique({ where: { id } })

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    return NextResponse.json(server)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, region, status, playerCount, maxPlayers, cpuUsage, memoryUsage } = body

    const updateData: {
      name?: string
      region?: string
      status?: string
      playerCount?: number
      maxPlayers?: number
      cpuUsage?: number
      memoryUsage?: number
      lastPing?: Date
    } = {}

    if (name) updateData.name = name
    if (region) updateData.region = region
    if (status) updateData.status = status
    if (playerCount !== undefined) updateData.playerCount = playerCount
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (cpuUsage !== undefined) updateData.cpuUsage = cpuUsage
    if (memoryUsage !== undefined) updateData.memoryUsage = memoryUsage
    updateData.lastPing = new Date()

    const server = await db.server.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(server)
  } catch {
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }
}
