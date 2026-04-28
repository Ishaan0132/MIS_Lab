import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: {
      OR?: Array<{ username: { contains: string }; email: { contains: string } }>
      status?: string
    } = {}

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
    }

    const players = await db.player.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.player.count({ where })

    return NextResponse.json({ players, total })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, level, xp, totalPlayTime, status } = body

    if (!username || !email) {
      return NextResponse.json({ error: 'Username and email are required' }, { status: 400 })
    }

    const existingPlayer = await db.player.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    })

    if (existingPlayer) {
      return NextResponse.json({ error: 'Player with this username or email already exists' }, { status: 400 })
    }

    const player = await db.player.create({
      data: {
        username,
        email,
        level: level || 1,
        xp: xp || 0,
        totalPlayTime: totalPlayTime || 0,
        status: status || 'ACTIVE'
      }
    })

    return NextResponse.json(player, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
