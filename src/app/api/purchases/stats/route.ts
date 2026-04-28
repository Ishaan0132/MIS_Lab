import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalPurchases = await db.purchase.count()
    const completedPurchases = await db.purchase.count({ where: { status: 'COMPLETED' } })
    const pendingPurchases = await db.purchase.count({ where: { status: 'PENDING' } })
    const failedPurchases = await db.purchase.count({ where: { status: 'FAILED' } })
    const refundedPurchases = await db.purchase.count({ where: { status: 'REFUNDED' } })

    const purchaseStats = await db.purchase.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      where: { status: 'COMPLETED' }
    })

    const purchasesByType = await db.purchase.groupBy({
      by: ['itemType'],
      _count: { id: true },
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    })

    const recentPurchases = await db.purchase.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      totalPurchases,
      completedPurchases,
      pendingPurchases,
      failedPurchases,
      refundedPurchases,
      totalRevenue: purchaseStats._sum.amount || 0,
      averagePurchase: purchaseStats._avg.amount || 0,
      purchasesByType,
      recentPurchases
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch purchase stats' }, { status: 500 })
  }
}
