import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (user) {
      return NextResponse.json({ valid: true, user })
    } else {
      return NextResponse.json({ valid: false })
    }
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
