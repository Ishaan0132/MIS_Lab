import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bug = await db.bugReport.findUnique({
      where: { id },
      include: {
        User_BugReport_reportedByToUser: { select: { id: true, name: true, email: true } },
        User_BugReport_assignedToToUser: { select: { id: true, name: true, email: true } },
        Game: { select: { id: true, title: true } }
      }
    })

    if (!bug) {
      return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
    }

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
    console.error('Error fetching bug:', error)
    return NextResponse.json({ error: 'Failed to fetch bug report' }, { status: 500 })
  }
}

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
    const { title, description, severity, status, assignedTo, gameId } = body

    const updateData: {
      title?: string
      description?: string | null
      severity?: string
      status?: string
      assignedTo?: string | null
      gameId?: string | null
      updatedAt: Date
    } = { updatedAt: new Date() }

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (severity) updateData.severity = severity
    if (status) updateData.status = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null
    if (gameId !== undefined) updateData.gameId = gameId || null

    const bug = await db.bugReport.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating bug:', error)
    return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.bugReport.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bug:', error)
    return NextResponse.json({ error: 'Failed to delete bug report' }, { status: 500 })
  }
}
