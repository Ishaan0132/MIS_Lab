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
    const months = parseInt(searchParams.get('months') || '12')

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Get all completed purchases
    const purchases = await db.purchase.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        amount: true,
        currency: true,
        itemType: true,
        createdAt: true
      }
    })

    // Group by month
    const revenueByMonth: Record<string, { month: string; revenue: number; count: number }> = {}
    
    // Initialize all months
    for (let i = 0; i <= months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      revenueByMonth[key] = { month: key, revenue: 0, count: 0 }
    }

    // Sum revenue by month
    purchases.forEach(purchase => {
      const date = new Date(purchase.createdAt)
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      if (revenueByMonth[key]) {
        revenueByMonth[key].revenue += purchase.amount
        revenueByMonth[key].count++
      }
    })

    // Revenue by item type
    const revenueByType: Record<string, number> = {}
    purchases.forEach(purchase => {
      if (!revenueByType[purchase.itemType]) {
        revenueByType[purchase.itemType] = 0
      }
      revenueByType[purchase.itemType] += purchase.amount
    })

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0)
    const averageOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0

    return NextResponse.json({
      monthlyRevenue: Object.values(revenueByMonth).sort((a, b) => a.month.localeCompare(b.month)),
      revenueByType: Object.entries(revenueByType).map(([type, revenue]) => ({
        type,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue * 100) : 0
      })),
      totalRevenue,
      averageOrderValue,
      totalOrders: purchases.length
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}
