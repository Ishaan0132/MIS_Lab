import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const games = await db.game.findMany({
      include: {
        _count: {
          select: { Purchase: true, BugReport: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(games)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, genre, releaseDate, status, playerCount } = body

    if (!title || !genre) {
      return NextResponse.json({ error: 'Title and genre are required' }, { status: 400 })
    }

    const game = await db.game.create({
      data: {
        id: `game_${Date.now()}`,
        title,
        genre,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        status: status || 'ACTIVE',
        playerCount: playerCount || 0
      }
    })

    return NextResponse.json(game, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
