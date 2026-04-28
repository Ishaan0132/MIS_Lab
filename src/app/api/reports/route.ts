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
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: { type?: string } = {}
    if (type) where.type = type

    const reports = await db.report.findMany({
      where,
      include: {
        User: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.report.count({ where })

    return NextResponse.json({ reports, total })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, type, format, data } = body

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    // Generate report data based on type
    let reportData = data || {}
    
    if (!data || Object.keys(data).length === 0) {
      // Generate data based on report type
      switch (type) {
        case 'DAILY':
          reportData = await generateDailyReportData()
          break
        case 'WEEKLY':
          reportData = await generateWeeklyReportData()
          break
        case 'MONTHLY':
          reportData = await generateMonthlyReportData()
          break
        default:
          reportData = await generateDailyReportData()
      }
    }

    const report = await db.report.create({
      data: {
        id: `report_${Date.now()}`,
        title,
        type,
        format: format || 'PDF',
        generatedBy: user.id,
        data: JSON.stringify(reportData)
      },
      include: {
        User: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

async function generateDailyReportData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const newPlayers = await db.player.count({
    where: { createdAt: { gte: today } }
  })

  const purchases = await db.purchase.findMany({
    where: { createdAt: { gte: today }, status: 'COMPLETED' }
  })

  const revenue = purchases.reduce((sum, p) => sum + p.amount, 0)

  const newBugs = await db.bugReport.count({
    where: { createdAt: { gte: today } }
  })

  const resolvedBugs = await db.bugReport.count({
    where: { updatedAt: { gte: today }, status: 'RESOLVED' }
  })

  return {
    date: today.toISOString().split('T')[0],
    newPlayers,
    totalPurchases: purchases.length,
    revenue,
    newBugs,
    resolvedBugs
  }
}

async function generateWeeklyReportData() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const newPlayers = await db.player.count({
    where: { createdAt: { gte: weekAgo } }
  })

  const purchases = await db.purchase.findMany({
    where: { createdAt: { gte: weekAgo }, status: 'COMPLETED' }
  })

  const revenue = purchases.reduce((sum, p) => sum + p.amount, 0)

  const newBugs = await db.bugReport.count({
    where: { createdAt: { gte: weekAgo } }
  })

  const resolvedBugs = await db.bugReport.count({
    where: { updatedAt: { gte: weekAgo }, status: 'RESOLVED' }
  })

  const playersByStatus = await db.player.groupBy({
    by: ['status'],
    _count: { id: true }
  })

  return {
    period: `${weekAgo.toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
    newPlayers,
    totalPurchases: purchases.length,
    revenue,
    newBugs,
    resolvedBugs,
    playersByStatus
  }
}

async function generateMonthlyReportData() {
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)

  const newPlayers = await db.player.count({
    where: { createdAt: { gte: monthAgo } }
  })

  const purchases = await db.purchase.findMany({
    where: { createdAt: { gte: monthAgo }, status: 'COMPLETED' }
  })

  const revenue = purchases.reduce((sum, p) => sum + p.amount, 0)

  const purchasesByType = await db.purchase.groupBy({
    by: ['itemType'],
    _count: { id: true },
    _sum: { amount: true },
    where: { createdAt: { gte: monthAgo }, status: 'COMPLETED' }
  })

  const bugsBySeverity = await db.bugReport.groupBy({
    by: ['severity'],
    _count: { id: true }
  })

  const games = await db.game.findMany({
    select: { title: true, playerCount: true, status: true }
  })

  return {
    period: `${monthAgo.toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
    newPlayers,
    totalPurchases: purchases.length,
    revenue,
    purchasesByType,
    bugsBySeverity,
    games
  }
}