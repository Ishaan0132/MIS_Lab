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
    const playerId = searchParams.get('playerId')
    const gameId = searchParams.get('gameId')
    const itemType = searchParams.get('itemType')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: {
      playerId?: string
      gameId?: string
      itemType?: string
      status?: string
    } = {}

    if (playerId) where.playerId = playerId
    if (gameId) where.gameId = gameId
    if (itemType) where.itemType = itemType
    if (status) where.status = status

    const purchases = await db.purchase.findMany({
      where,
      include: {
        Player: { select: { id: true, username: true, email: true } },
        Game: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.purchase.count({ where })

    return NextResponse.json({ purchases, total })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { playerId, gameId, itemType, itemName, amount, currency, status } = body

    if (!playerId || !gameId || !itemType || !itemName || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const purchase = await db.purchase.create({
      data: {
        id: `purchase_${Date.now()}`,
        playerId,
        gameId,
        itemType,
        itemName,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        status: status || 'COMPLETED'
      },
      include: {
        Player: { select: { id: true, username: true } },
        Game: { select: { id: true, title: true } }
      }
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 })
  }
}
