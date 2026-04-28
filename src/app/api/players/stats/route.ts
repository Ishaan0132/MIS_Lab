import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalPlayers = await db.player.count()
    const activePlayers = await db.player.count({ where: { status: 'ACTIVE' } })
    const inactivePlayers = await db.player.count({ where: { status: 'INACTIVE' } })
    const bannedPlayers = await db.player.count({ where: { status: 'BANNED' } })

    const levelStats = await db.player.aggregate({
      _avg: { level: true, xp: true, totalPlayTime: true },
      _max: { level: true, xp: true },
      _min: { level: true, xp: true }
    })

    const recentPlayers = await db.player.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      totalPlayers,
      activePlayers,
      inactivePlayers,
      bannedPlayers,
      recentPlayers,
      averageLevel: levelStats._avg.level || 0,
      averageXp: levelStats._avg.xp || 0,
      averagePlayTime: levelStats._avg.totalPlayTime || 0,
      maxLevel: levelStats._max.level || 0,
      maxXp: levelStats._max.xp || 0
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 })
  }
}
