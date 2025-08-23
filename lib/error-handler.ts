/**
 * Global Error Handler for IPC Application
 * Provides user-friendly error messages and logging
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Error type definitions
export const ErrorTypes = {
  // Database Errors
  DB_CONNECTION: 'DB_CONNECTION',
  DB_QUERY: 'DB_QUERY',
  DB_CONSTRAINT: 'DB_CONSTRAINT',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  
  // API Errors
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',
  
  // Auth Errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // File Errors
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_INVALID: 'FILE_TYPE_INVALID',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  OFFLINE: 'OFFLINE'
} as const

// User-friendly error messages
const errorMessages: Record<string, string> = {
  [ErrorTypes.DB_CONNECTION]: 'Unable to connect to database. Please try again later.',
  [ErrorTypes.DB_QUERY]: 'Failed to retrieve data. Please refresh and try again.',
  [ErrorTypes.DB_CONSTRAINT]: 'This operation violates data constraints. Please check your input.',
  [ErrorTypes.DB_NOT_FOUND]: 'The requested data was not found.',
  
  [ErrorTypes.API_KEY_MISSING]: 'API configuration is incomplete. Please contact support.',
  [ErrorTypes.API_REQUEST_FAILED]: 'External service request failed. Please try again.',
  [ErrorTypes.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorTypes.API_UNAUTHORIZED]: 'API authentication failed. Please check your credentials.',
  
  [ErrorTypes.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password.',
  [ErrorTypes.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorTypes.AUTH_PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  
  [ErrorTypes.VALIDATION_FAILED]: 'Please check your input and try again.',
  [ErrorTypes.INVALID_INPUT]: 'The provided input is invalid.',
  [ErrorTypes.REQUIRED_FIELD]: 'Please fill in all required fields.',
  
  [ErrorTypes.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again.',
  [ErrorTypes.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit.',
  [ErrorTypes.FILE_TYPE_INVALID]: 'This file type is not supported.',
  
  [ErrorTypes.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [ErrorTypes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorTypes.OFFLINE]: 'You are currently offline. Please check your connection.'
}

// Error handler function
export function handleError(error: any): {
  message: string
  code: string
  details?: any
  shouldReport: boolean
} {
  // Handle known AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      shouldReport: error.statusCode >= 500
    }
  }
  
  // Handle Supabase errors
  if (error?.code && error?.message) {
    const code = mapSupabaseError(error.code)
    return {
      message: errorMessages[code] || error.message,
      code,
      details: error,
      shouldReport: true
    }
  }
  
  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      message: errorMessages[ErrorTypes.NETWORK_ERROR],
      code: ErrorTypes.NETWORK_ERROR,
      details: error,
      shouldReport: false
    }
  }
  
  // Handle validation errors
  if (error?.name === 'ValidationError') {
    return {
      message: error.message || errorMessages[ErrorTypes.VALIDATION_FAILED],
      code: ErrorTypes.VALIDATION_FAILED,
      details: error,
      shouldReport: false
    }
  }
  
  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    details: error,
    shouldReport: true
  }
}

// Map Supabase error codes to our error types
function mapSupabaseError(code: string): string {
  const mapping: Record<string, string> = {
    '23505': ErrorTypes.DB_CONSTRAINT, // Unique violation
    '23503': ErrorTypes.DB_CONSTRAINT, // Foreign key violation
    '23502': ErrorTypes.REQUIRED_FIELD, // Not null violation
    '42P01': ErrorTypes.DB_NOT_FOUND, // Table not found
    '42703': ErrorTypes.DB_QUERY, // Column not found
    'PGRST116': ErrorTypes.DB_NOT_FOUND, // No rows found
    'PGRST301': ErrorTypes.AUTH_PERMISSION_DENIED, // Permission denied
  }
  
  return mapping[code] || ErrorTypes.DB_QUERY
}

// Error logging function
export async function logError(error: any, context?: any): Promise<void> {
  const errorInfo = handleError(error)
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: errorInfo.message,
      code: errorInfo.code,
      details: errorInfo.details,
      context,
      timestamp: new Date().toISOString()
    })
  }
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production' && errorInfo.shouldReport) {
    // TODO: Send to Sentry, LogRocket, or other monitoring service
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorInfo,
          context,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }
}

// React error boundary helper
export function getErrorMessage(error: any): string {
  const { message } = handleError(error)
  return message
}

// Async error wrapper for try-catch blocks
export async function tryAsync<T>(
  fn: () => Promise<T>,
  errorCode?: string
): Promise<[T | null, AppError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const handledError = handleError(error)
    return [
      null,
      new AppError(
        handledError.message,
        errorCode || handledError.code,
        500,
        handledError.details
      )
    ]
  }
}