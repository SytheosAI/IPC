'use client'

import React, { createContext, useContext, useCallback, useEffect, useReducer, useRef } from 'react'
import { Save, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// Auto-save States
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface AutoSaveState {
  status: AutoSaveStatus
  lastSaved: Date | null
  error: string | null
  isDirty: boolean
  isOnline: boolean
}

// Form State Management
interface FormState {
  data: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  autoSave: AutoSaveState
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_VALIDATION'; field: string; isValid: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET_FORM'; initialData?: Record<string, any> }
  | { type: 'SET_AUTO_SAVE_STATUS'; status: AutoSaveStatus; error?: string }
  | { type: 'SET_ONLINE_STATUS'; isOnline: boolean }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_DIRTY' }

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        autoSave: { ...state.autoSave, isDirty: true }
      }

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      }

    case 'CLEAR_ERROR':
      const { [action.field]: removedError, ...restErrors } = state.errors
      return {
        ...state,
        errors: restErrors
      }

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.touched }
      }

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      }

    case 'RESET_FORM':
      return {
        ...state,
        data: action.initialData || {},
        errors: {},
        touched: {},
        isSubmitting: false,
        autoSave: {
          ...state.autoSave,
          isDirty: false,
          status: 'idle'
        }
      }

    case 'SET_AUTO_SAVE_STATUS':
      return {
        ...state,
        autoSave: {
          ...state.autoSave,
          status: action.status,
          error: action.error || null
        }
      }

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        autoSave: {
          ...state.autoSave,
          isOnline: action.isOnline,
          status: action.isOnline ? 'idle' : 'offline'
        }
      }

    case 'MARK_SAVED':
      return {
        ...state,
        autoSave: {
          ...state.autoSave,
          status: 'saved',
          lastSaved: new Date(),
          isDirty: false,
          error: null
        }
      }

    case 'MARK_DIRTY':
      return {
        ...state,
        autoSave: {
          ...state.autoSave,
          isDirty: true,
          status: 'idle'
        }
      }

    default:
      return state
  }
}

// Context Types
interface FormStateContextType {
  state: FormState
  setField: (field: string, value: any) => void
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  setTouched: (field: string, touched: boolean) => void
  setSubmitting: (isSubmitting: boolean) => void
  resetForm: (initialData?: Record<string, any>) => void
  validateForm: () => boolean
  submitForm: () => Promise<void>
}

const FormStateContext = createContext<FormStateContextType | null>(null)

export const useFormState = () => {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within FormStateProvider')
  }
  return context
}

// Form State Provider Props
interface FormStateProviderProps {
  children: React.ReactNode
  initialData?: Record<string, any>
  validationRules?: Record<string, (value: any) => string | null>
  onAutoSave?: (data: Record<string, any>) => Promise<void>
  onSubmit?: (data: Record<string, any>) => Promise<void>
  autoSaveDelay?: number
  enableOfflineSupport?: boolean
}

export function FormStateProvider({
  children,
  initialData = {},
  validationRules = {},
  onAutoSave,
  onSubmit,
  autoSaveDelay = 2000,
  enableOfflineSupport = true
}: FormStateProviderProps) {
  const [state, dispatch] = useReducer(formReducer, {
    data: initialData,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
    autoSave: {
      status: 'idle',
      lastSaved: null,
      error: null,
      isDirty: false,
      isOnline: navigator?.onLine ?? true
    }
  })

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChangesRef = useRef<Record<string, any>>({})

  // Online/Offline Detection
  useEffect(() => {
    if (!enableOfflineSupport) return

    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', isOnline: true })

      // Try to save pending changes when coming back online
      if (Object.keys(pendingChangesRef.current).length > 0) {
        handleAutoSave(pendingChangesRef.current)
      }
    }

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enableOfflineSupport])

  // Auto-save Logic
  const handleAutoSave = useCallback(async (data: Record<string, any>) => {
    if (!onAutoSave || !state.autoSave.isOnline) {
      // Store changes for when we come back online
      pendingChangesRef.current = { ...pendingChangesRef.current, ...data }
      return
    }

    try {
      dispatch({ type: 'SET_AUTO_SAVE_STATUS', status: 'saving' })
      await onAutoSave(data)
      dispatch({ type: 'MARK_SAVED' })
      pendingChangesRef.current = {} // Clear pending changes
    } catch (error) {
      dispatch({
        type: 'SET_AUTO_SAVE_STATUS',
        status: 'error',
        error: error instanceof Error ? error.message : 'Auto-save failed'
      })
    }
  }, [onAutoSave, state.autoSave.isOnline])

  // Debounced Auto-save Effect
  useEffect(() => {
    if (!state.autoSave.isDirty || !onAutoSave) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave(state.data)
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state.data, state.autoSave.isDirty, handleAutoSave, autoSaveDelay, onAutoSave])

  // Form Actions
  const setField = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value })

    // Validate field if rules exist
    if (validationRules[field]) {
      const error = validationRules[field](value)
      if (error) {
        dispatch({ type: 'SET_ERROR', field, error })
      } else {
        dispatch({ type: 'CLEAR_ERROR', field })
      }
    }
  }, [validationRules])

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error })
  }, [])

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field })
  }, [])

  const setTouched = useCallback((field: string, touched: boolean) => {
    dispatch({ type: 'SET_TOUCHED', field, touched })
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting })
  }, [])

  const resetForm = useCallback((initialData?: Record<string, any>) => {
    dispatch({ type: 'RESET_FORM', initialData })
  }, [])

  const validateForm = useCallback(() => {
    let isValid = true

    // Run all validation rules
    Object.keys(validationRules).forEach(field => {
      const value = state.data[field]
      const error = validationRules[field](value)

      if (error) {
        dispatch({ type: 'SET_ERROR', field, error })
        isValid = false
      } else {
        dispatch({ type: 'CLEAR_ERROR', field })
      }
    })

    return isValid && Object.keys(state.errors).length === 0
  }, [state.data, state.errors, validationRules])

  const submitForm = useCallback(async () => {
    if (!onSubmit) return

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true })

    try {
      const isValid = validateForm()
      if (!isValid) {
        throw new Error('Form validation failed')
      }

      await onSubmit(state.data)
      dispatch({ type: 'MARK_SAVED' })
    } catch (error) {
      throw error
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false })
    }
  }, [onSubmit, state.data, validateForm])

  const contextValue: FormStateContextType = {
    state,
    setField,
    setError,
    clearError,
    setTouched,
    setSubmitting,
    resetForm,
    validateForm,
    submitForm
  }

  return (
    <FormStateContext.Provider value={contextValue}>
      {children}
    </FormStateContext.Provider>
  )
}

// Auto-save Status Indicator Component
interface AutoSaveIndicatorProps {
  className?: string
  showDetailedStatus?: boolean
}

export function AutoSaveIndicator({
  className,
  showDetailedStatus = false
}: AutoSaveIndicatorProps) {
  const { state } = useFormState()
  const { autoSave } = state

  const getStatusConfig = () => {
    switch (autoSave.status) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          pulse: true
        }
      case 'saved':
        return {
          icon: CheckCircle,
          text: autoSave.lastSaved
            ? `Saved at ${autoSave.lastSaved.toLocaleTimeString()}`
            : 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          pulse: false
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: autoSave.error || 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          pulse: false
        }
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline - changes will sync when connected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          pulse: false
        }
      default:
        return {
          icon: autoSave.isOnline ? Wifi : WifiOff,
          text: autoSave.isDirty ? 'Unsaved changes' : 'Up to date',
          color: autoSave.isDirty ? 'text-yellow-600' : 'text-gray-600',
          bgColor: autoSave.isDirty ? 'bg-yellow-50' : 'bg-gray-50',
          pulse: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  if (!showDetailedStatus && autoSave.status === 'idle' && !autoSave.isDirty) {
    return null
  }

  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
      config.color,
      config.bgColor,
      className
    )}>
      <Icon className={cn(
        "h-3 w-3 mr-2",
        config.pulse && "animate-pulse"
      )} />
      <span>{config.text}</span>
    </div>
  )
}

// Form Actions Bar Component
interface FormActionsBarProps {
  onSave?: () => void
  onCancel?: () => void
  onSubmit?: () => void
  saveLabel?: string
  submitLabel?: string
  cancelLabel?: string
  showAutoSaveStatus?: boolean
  className?: string
}

export function FormActionsBar({
  onSave,
  onCancel,
  onSubmit,
  saveLabel = 'Save Draft',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  showAutoSaveStatus = true,
  className
}: FormActionsBarProps) {
  const { state, submitForm } = useFormState()

  const handleSubmit = async () => {
    try {
      if (onSubmit) {
        await onSubmit()
      } else {
        await submitForm()
      }
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  return (
    <div className={cn(
      "flex items-center justify-between py-4 border-t border-gray-200 bg-white",
      className
    )}>
      <div className="flex items-center space-x-4">
        {showAutoSaveStatus && <AutoSaveIndicator showDetailedStatus />}
      </div>

      <div className="flex items-center space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {cancelLabel}
          </button>
        )}

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={state.isSubmitting}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors duration-200",
              "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveLabel}
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={state.isSubmitting || !state.autoSave.isOnline}
          className={cn(
            "flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200",
            "bg-indigo-600 hover:bg-indigo-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {state.isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  )
}

// Enhanced Input Component with Form State Integration
interface FormInputProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  rows?: number
  className?: string
}

export function FormInput({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  options = [],
  rows = 3,
  className
}: FormInputProps) {
  const { state, setField, setTouched } = useFormState()

  const value = state.data[name] || ''
  const error = state.errors[name]
  const touched = state.touched[name]

  const handleChange = (newValue: string) => {
    setField(name, newValue)
    if (!touched) {
      setTouched(name, true)
    }
  }

  const handleBlur = () => {
    setTouched(name, true)
  }

  const hasError = touched && error

  const baseClasses = cn(
    "block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    {
      "border-gray-300": !hasError,
      "border-red-300 bg-red-50": hasError
    }
  )

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          className={baseClasses}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className={baseClasses}
        >
          <option value="">{placeholder || `Select ${label.toLowerCase()}...`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}

      {hasError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  )
}