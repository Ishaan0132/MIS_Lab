import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const servers = await db.server.findMany()

    const totalServers = servers.length
    const onlineServers = servers.filter(s => s.status === 'ONLINE').length
    const offlineServers = servers.filter(s => s.status === 'OFFLINE').length
    const maintenanceServers = servers.filter(s => s.status === 'MAINTENANCE').length

    const totalPlayers = servers.reduce((sum, s) => sum + s.playerCount, 0)
    const totalCapacity = servers.reduce((sum, s) => sum + s.maxPlayers, 0)
    const averageCpu = servers.reduce((sum, s) => sum + s.cpuUsage, 0) / (totalServers || 1)
    const averageMemory = servers.reduce((sum, s) => sum + s.memoryUsage, 0) / (totalServers || 1)

    return NextResponse.json({
      totalServers,
      onlineServers,
      offlineServers,
      maintenanceServers,
      totalPlayers,
      totalCapacity,
      capacityUtilization: (totalPlayers / totalCapacity * 100) || 0,
      averageCpu,
      averageMemory,
      servers
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch server performance' }, { status: 500 })
  }
}
