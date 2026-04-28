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
    const player = await db.player.findUnique({
      where: { id },
      include: {
        purchases: {
          include: { game: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
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
    const { username, email, level, xp, totalPlayTime, status, lastLogin } = body

    const updateData: {
      username?: string
      email?: string
      level?: number
      xp?: number
      totalPlayTime?: number
      status?: string
      lastLogin?: Date
    } = {}

    if (username) updateData.username = username
    if (email) updateData.email = email
    if (level !== undefined) updateData.level = level
    if (xp !== undefined) updateData.xp = xp
    if (totalPlayTime !== undefined) updateData.totalPlayTime = totalPlayTime
    if (status) updateData.status = status
    if (lastLogin) updateData.lastLogin = new Date(lastLogin)

    const player = await db.player.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.player.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
