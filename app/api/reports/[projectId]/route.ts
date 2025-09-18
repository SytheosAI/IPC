import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const reports = await db.inspectionReports.getByProject(params.projectId)
    return NextResponse.json(reports)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json()

    // Ensure project_id is set and add metadata
    const reportData = {
      ...body,
      project_id: params.projectId,
      status: 'draft' as const,
      generated_by: body.generated_by || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const report = await db.inspectionReports.create(reportData)

    // Log the activity
    await db.activityLogs.create({
      action: 'created_report',
      entity_type: 'inspection_report',
      entity_id: report.id,
      metadata: {
        project_id: params.projectId,
        report_type: report.report_type,
        report_title: report.report_title
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}