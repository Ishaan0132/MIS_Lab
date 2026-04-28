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
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get player registrations by day
    const players = await db.player.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    })

    // Group by day
    const activityByDay: Record<string, { date: string; newPlayers: number; cumulative: number }> = {}
    
    // Initialize all days
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      activityByDay[key] = { date: key, newPlayers: 0, cumulative: 0 }
    }

    // Count new players by day
    players.forEach(player => {
      const key = new Date(player.createdAt).toISOString().split('T')[0]
      if (activityByDay[key]) {
        activityByDay[key].newPlayers++
      }
    })

    // Calculate cumulative
    const sortedDays = Object.keys(activityByDay).sort()
    let cumulative = 0
    sortedDays.forEach(day => {
      cumulative += activityByDay[day].newPlayers
      activityByDay[day].cumulative = cumulative
    })

    // Get active players by last login
    const activePlayersToday = await db.player.count({
      where: {
        lastLogin: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    const activePlayersWeek = await db.player.count({
      where: {
        lastLogin: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    })

    const activePlayersMonth = await db.player.count({
      where: {
        lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })

    return NextResponse.json({
      dailyActivity: Object.values(activityByDay).sort((a, b) => a.date.localeCompare(b.date)),
      activePlayers: {
        today: activePlayersToday,
        week: activePlayersWeek,
        month: activePlayersMonth
      }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player activity' }, { status: 500 })
  }
}
