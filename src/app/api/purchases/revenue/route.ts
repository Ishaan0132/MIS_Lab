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
    const period = searchParams.get('period') || 'monthly' // daily, weekly, monthly

    const now = new Date()
    let startDate: Date
    let groupFormat: string

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        groupFormat = '%Y-%m-%d'
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
        groupFormat = '%Y-W%W'
        break
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000)
        groupFormat = '%Y-%m'
        break
    }

    const purchases = await db.purchase.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true
      }
    })

    // Group by period manually since SQLite doesn't have date formatting functions
    const revenueByPeriod: Record<string, number> = {}
    
    purchases.forEach(purchase => {
      let key: string
      const date = new Date(purchase.createdAt)
      
      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekNumber = getWeekNumber(date)
          key = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`
          break
        case 'monthly':
        default:
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
      }
      
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + purchase.amount
    })

    const result = Object.entries(revenueByPeriod)
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
