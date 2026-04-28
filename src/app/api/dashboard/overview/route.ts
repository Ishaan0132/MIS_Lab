import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic counts
    const totalPlayers = await db.player.count()
    const activePlayers = await db.player.count({ where: { status: 'ACTIVE' } })
    const totalGames = await db.game.count()
    const activeGames = await db.game.count({ where: { status: 'ACTIVE' } })

    // Get revenue
    const purchases = await db.purchase.findMany({
      where: { status: 'COMPLETED' }
    })
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0)

    // Get server status
    const servers = await db.server.findMany()
    const onlineServers = servers.filter(s => s.status === 'ONLINE').length
    const totalServerPlayers = servers.reduce((sum, s) => sum + s.playerCount, 0)

    // Get bug stats
    const openBugs = await db.bugReport.count({ where: { status: 'OPEN' } })
    const criticalBugs = await db.bugReport.count({ where: { severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } } })

    // Get recent activity
    const recentPlayers = await db.player.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    const recentPurchases = await db.purchase.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: 'COMPLETED'
      }
    })

    const recentRevenue = await db.purchase.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      players: {
        total: totalPlayers,
        active: activePlayers,
        recent: recentPlayers
      },
      games: {
        total: totalGames,
        active: activeGames
      },
      revenue: {
        total: totalRevenue,
        recent: recentRevenue._sum.amount || 0
      },
      servers: {
        total: servers.length,
        online: onlineServers,
        totalPlayers: totalServerPlayers
      },
      bugs: {
        open: openBugs,
        critical: criticalBugs
      },
      activity: {
        recentPlayers,
        recentPurchases
      }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard overview' }, { status: 500 })
  }
}
