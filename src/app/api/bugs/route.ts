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
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const gameId = searchParams.get('gameId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: {
      status?: string
      severity?: string
      gameId?: string
    } = {}

    if (status) where.status = status
    if (severity) where.severity = severity
    if (gameId) where.gameId = gameId

    const bugs = await db.bugReport.findMany({
      where,
      include: {
        User_BugReport_reportedByToUser: { select: { id: true, name: true, email: true } },
        User_BugReport_assignedToToUser: { select: { id: true, name: true, email: true } },
        Game: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.bugReport.count({ where })

    // Transform to simpler names for frontend
    const transformedBugs = bugs.map(bug => ({
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
    }))

    return NextResponse.json({ bugs: transformedBugs, total })
  } catch (error) {
    console.error('Error fetching bugs:', error)
    return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, severity, assignedTo, gameId } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const bug = await db.bugReport.create({
      data: {
        id: `bug_${Date.now()}`,
        title,
        description: description || null,
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        reportedBy: user.id,
        assignedTo: assignedTo || null,
        gameId: gameId || null,
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

    return NextResponse.json(transformedBug, { status: 201 })
  } catch (error) {
    console.error('Error creating bug:', error)
    return NextResponse.json({ error: 'Failed to create bug report' }, { status: 500 })
  }
}