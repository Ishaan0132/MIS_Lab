import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const bug = await db.bugReport.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        User_BugReport_reportedByToUser: { select: { id: true, name: true, email: true } },
        User_BugReport_assignedToToUser: { select: { id: true, name: true, email: true } },
        Game: { select: { id: true, title: true } }
      }
    })

    // Transform for frontend
    const transformedBug = {
      id: bug.id,
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      status: bug.status,
      gameId: bug.gameId,
      game: bug.Game ? { id: bug.Game.id, title: bug.Game.title } : null,
      reportedBy: bug.reportedBy,
      reporter: bug.User_BugReport_reportedByToUser ? { 
        id: bug.User_BugReport_reportedByToUser.id, 
        name: bug.User_BugReport_reportedByToUser.name, 
        email: bug.User_BugReport_reportedByToUser.email 
      } : null,
      assignedTo: bug.assignedTo,
      assignee: bug.User_BugReport_assignedToToUser ? { 
        id: bug.User_BugReport_assignedToToUser.id, 
        name: bug.User_BugReport_assignedToToUser.name, 
        email: bug.User_BugReport_assignedToToUser.email 
      } : null,
      createdAt: bug.createdAt,
      updatedAt: bug.updatedAt
    }

    return NextResponse.json(transformedBug)
  } catch (error) {
    console.error('Error updating bug status:', error)
    return NextResponse.json({ error: 'Failed to update bug status' }, { status: 500 })
  }
}