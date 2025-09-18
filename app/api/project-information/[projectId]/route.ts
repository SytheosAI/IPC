import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const projectInfo = await db.projectInfo.get(projectId)

    if (!projectInfo) {
      return NextResponse.json({ error: 'Project information not found' }, { status: 404 })
    }

    return NextResponse.json(projectInfo)
  } catch (error) {
    console.error('Failed to fetch project information:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const body = await request.json()

    // Ensure project_id is set
    const projectInfo = {
      ...body,
      project_id: projectId,
      updated_at: new Date().toISOString()
    }

    const updatedInfo = await db.projectInfo.upsert(projectInfo)

    // Log the activity
    await db.activityLogs.create({
      action: 'updated_project_information',
      entity_type: 'project_information',
      entity_id: updatedInfo.id,
      metadata: { project_id: projectId }
    })

    return NextResponse.json(updatedInfo)
  } catch (error) {
    console.error('Failed to update project information:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}