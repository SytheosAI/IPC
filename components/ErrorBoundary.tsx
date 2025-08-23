'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, FileText } from 'lucide-react'
import { logError, getErrorMessage } from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorMessage: string
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorMessage: '',
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const errorMessage = getErrorMessage(error)
    
    return {
      hasError: true,
      error,
      errorMessage,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to monitoring service
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorMessage: '',
      errorId: ''
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-center text-gray-600 mb-6">
                {this.state.errorMessage}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs font-mono text-gray-700 mb-1">
                    Error ID: {this.state.errorId}
                  </p>
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Technical Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}