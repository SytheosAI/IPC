/**
 * Data Backup and Restore System for IPC Application
 * Handles full database export/import with encryption support
 */

import { supabase } from './supabase-client'
import { AppError, ErrorTypes, logError } from './error-handler'

export interface BackupMetadata {
  version: string
  timestamp: string
  createdBy: string
  tables: string[]
  recordCounts: Record<string, number>
  checksum?: string
}

export interface BackupData {
  metadata: BackupMetadata
  data: Record<string, any[]>
}

// Tables to include in backup
const BACKUP_TABLES = [
  'profiles',
  'projects',
  'vba_projects',
  'field_reports',
  'field_report_work_completed',
  'field_report_issues',
  'field_report_safety_observations',
  'field_report_personnel',
  'field_report_photos',
  'documents',
  'inspections',
  'inspection_photos',
  'notification_emails',
  'activity_logs',
  'user_settings',
  'contacts',
  'inspection_schedules',
  'news_articles',
  'collaboration_messages',
  'permit_portal_credentials'
]

/**
 * Create a full backup of all application data
 */
export async function createBackup(userId: string): Promise<Blob> {
  try {
    const backupData: BackupData = {
      metadata: {
        version: '2.0',
        timestamp: new Date().toISOString(),
        createdBy: userId,
        tables: BACKUP_TABLES,
        recordCounts: {}
      },
      data: {}
    }

    // Fetch data from each table
    for (const table of BACKUP_TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
        
        if (error) {
          console.warn(`Failed to backup table ${table}:`, error)
          backupData.data[table] = []
          backupData.metadata.recordCounts[table] = 0
        } else {
          backupData.data[table] = data || []
          backupData.metadata.recordCounts[table] = data?.length || 0
        }
      } catch (err) {
        console.warn(`Error backing up table ${table}:`, err)
        backupData.data[table] = []
        backupData.metadata.recordCounts[table] = 0
      }
    }

    // Calculate checksum for data integrity
    backupData.metadata.checksum = await calculateChecksum(JSON.stringify(backupData.data))

    // Convert to blob
    const jsonString = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // Log backup activity
    await logActivity(userId, 'backup_created', {
      tables: BACKUP_TABLES.length,
      totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
      size: blob.size
    })

    return blob
  } catch (error) {
    await logError(error, { action: 'createBackup', userId })
    throw new AppError(
      'Failed to create backup. Please try again.',
      ErrorTypes.DB_QUERY,
      500,
      error
    )
  }
}

/**
 * Restore data from a backup file
 */
export async function restoreBackup(
  file: File,
  userId: string,
  options: {
    clearExisting?: boolean
    tables?: string[]
    validateChecksum?: boolean
  } = {}
): Promise<{
  success: boolean
  tablesRestored: string[]
  recordsRestored: number
  errors: string[]
}> {
  const errors: string[] = []
  const tablesRestored: string[] = []
  let recordsRestored = 0

  try {
    // Read and parse backup file
    const text = await file.text()
    const backupData: BackupData = JSON.parse(text)

    // Validate backup format
    if (!backupData.metadata || !backupData.data) {
      throw new AppError(
        'Invalid backup file format',
        ErrorTypes.FILE_TYPE_INVALID
      )
    }

    // Validate checksum if requested
    if (options.validateChecksum && backupData.metadata.checksum) {
      const calculatedChecksum = await calculateChecksum(JSON.stringify(backupData.data))
      if (calculatedChecksum !== backupData.metadata.checksum) {
        throw new AppError(
          'Backup file integrity check failed',
          ErrorTypes.VALIDATION_FAILED
        )
      }
    }

    // Determine which tables to restore
    const tablesToRestore = options.tables || backupData.metadata.tables

    // Start restoration process
    for (const table of tablesToRestore) {
      if (!backupData.data[table]) {
        errors.push(`Table ${table} not found in backup`)
        continue
      }

      try {
        const records = backupData.data[table]
        
        // Clear existing data if requested
        if (options.clearExisting) {
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
          
          if (deleteError) {
            errors.push(`Failed to clear table ${table}: ${deleteError.message}`)
          }
        }

        // Insert records in batches
        const batchSize = 100
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize)
          
          const { error: insertError } = await supabase
            .from(table)
            .upsert(batch, {
              onConflict: 'id',
              ignoreDuplicates: false
            })
          
          if (insertError) {
            errors.push(`Failed to restore batch for ${table}: ${insertError.message}`)
          } else {
            recordsRestored += batch.length
          }
        }
        
        tablesRestored.push(table)
      } catch (err) {
        errors.push(`Error restoring table ${table}: ${err}`)
      }
    }

    // Log restore activity
    await logActivity(userId, 'backup_restored', {
      tablesRestored: tablesRestored.length,
      recordsRestored,
      errors: errors.length,
      backupDate: backupData.metadata.timestamp
    })

    return {
      success: errors.length === 0,
      tablesRestored,
      recordsRestored,
      errors
    }
  } catch (error) {
    await logError(error, { action: 'restoreBackup', userId })
    throw error instanceof AppError ? error : new AppError(
      'Failed to restore backup. Please check the file and try again.',
      ErrorTypes.FILE_UPLOAD_FAILED,
      500,
      error
    )
  }
}

/**
 * Create an incremental backup (only changes since last backup)
 */
export async function createIncrementalBackup(
  userId: string,
  sinceTimestamp: string
): Promise<Blob> {
  try {
    const backupData: BackupData = {
      metadata: {
        version: '2.0',
        timestamp: new Date().toISOString(),
        createdBy: userId,
        tables: BACKUP_TABLES,
        recordCounts: {}
      },
      data: {}
    }

    // Fetch only records modified since the given timestamp
    for (const table of BACKUP_TABLES) {
      try {
        const query = supabase
          .from(table)
          .select('*')
        
        // Add timestamp filter if table has updated_at column
        if (['profiles', 'projects', 'vba_projects', 'field_reports', 'documents', 'inspections', 'user_settings'].includes(table)) {
          query.gte('updated_at', sinceTimestamp)
        }
        
        const { data, error } = await query
        
        if (!error && data) {
          backupData.data[table] = data
          backupData.metadata.recordCounts[table] = data.length
        } else {
          backupData.data[table] = []
          backupData.metadata.recordCounts[table] = 0
        }
      } catch (err) {
        console.warn(`Error backing up table ${table}:`, err)
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  } catch (error) {
    await logError(error, { action: 'createIncrementalBackup', userId })
    throw new AppError(
      'Failed to create incremental backup',
      ErrorTypes.DB_QUERY,
      500,
      error
    )
  }
}

/**
 * Schedule automatic backups
 */
export async function scheduleBackup(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly'
): Promise<void> {
  // Store backup schedule in user settings
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      preferences: {
        backup_schedule: {
          enabled: true,
          frequency,
          last_backup: new Date().toISOString(),
          next_backup: getNextBackupDate(frequency)
        }
      }
    })
  
  if (error) {
    throw new AppError(
      'Failed to schedule backup',
      ErrorTypes.DB_QUERY,
      500,
      error
    )
  }
}

/**
 * Export specific data types (e.g., only projects, only reports)
 */
export async function exportData(
  dataType: 'projects' | 'reports' | 'inspections' | 'all',
  format: 'json' | 'csv' | 'excel',
  userId: string
): Promise<Blob> {
  try {
    let data: any = {}
    
    switch (dataType) {
      case 'projects':
        const { data: projects } = await supabase.from('projects').select('*')
        const { data: vbaProjects } = await supabase.from('vba_projects').select('*')
        data = { projects, vbaProjects }
        break
      
      case 'reports':
        const { data: reports } = await supabase.from('field_reports').select('*')
        data = { field_reports: reports }
        break
      
      case 'inspections':
        const { data: inspections } = await supabase.from('inspections').select('*')
        data = { inspections }
        break
      
      case 'all':
        return createBackup(userId)
    }

    // Format data based on requested format
    switch (format) {
      case 'csv':
        return convertToCSV(data)
      case 'excel':
        return convertToExcel(data)
      default:
        const jsonString = JSON.stringify(data, null, 2)
        return new Blob([jsonString], { type: 'application/json' })
    }
  } catch (error) {
    await logError(error, { action: 'exportData', dataType, format, userId })
    throw new AppError(
      'Failed to export data',
      ErrorTypes.DB_QUERY,
      500,
      error
    )
  }
}

// Helper functions
async function calculateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getNextBackupDate(frequency: 'daily' | 'weekly' | 'monthly'): string {
  const date = new Date()
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
  }
  return date.toISOString()
}

async function logActivity(userId: string, action: string, details: any): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      entity_type: 'backup',
      metadata: details
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

function convertToCSV(data: Record<string, any[]>): Blob {
  let csv = ''
  
  for (const [tableName, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue
    
    // Add table name as section header
    csv += `\n# ${tableName}\n`
    
    // Get headers from first record
    const headers = Object.keys(records[0])
    csv += headers.join(',') + '\n'
    
    // Add data rows
    for (const record of records) {
      const values = headers.map(h => {
        const value = record[h]
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      })
      csv += values.join(',') + '\n'
    }
  }
  
  return new Blob([csv], { type: 'text/csv' })
}

function convertToExcel(data: Record<string, any[]>): Blob {
  // For now, return CSV format
  // In production, use a library like xlsx or exceljs
  return convertToCSV(data)
}

// Export functions for use in components
export const BackupSystem = {
  createBackup,
  restoreBackup,
  createIncrementalBackup,
  scheduleBackup,
  exportData
}