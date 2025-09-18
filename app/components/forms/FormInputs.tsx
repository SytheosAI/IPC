'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff, Calendar, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Base Input Types
interface BaseInputProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  touched?: boolean
  onValidation?: (isValid: boolean) => void
}

// Text Input Component
interface TextInputProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  maxLength?: number
  pattern?: string
  autoComplete?: string
}

export function TextInput({
  label,
  description,
  error,
  required = false,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  pattern,
  autoComplete,
  className,
  touched = false,
  onValidation
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const validateInput = useCallback((inputValue: string) => {
    let valid = true

    if (required && !inputValue.trim()) {
      valid = false
    }

    if (pattern && inputValue && !new RegExp(pattern).test(inputValue)) {
      valid = false
    }

    if (type === 'email' && inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      valid = false
    }

    setIsValid(valid)
    onValidation?.(valid)
    return valid
  }, [required, pattern, type, onValidation])

  useEffect(() => {
    validateInput(value)
  }, [value, validateInput])

  const hasError = touched && (error || !isValid)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={cn(
            "block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            {
              "border-gray-300": !hasError && !touched,
              "border-red-300 bg-red-50": hasError,
              "border-green-300 bg-green-50": touched && isValid && !error,
              "pr-10": isPassword || hasError || (touched && isValid)
            }
          )}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}

        {/* Validation Icons */}
        {!isPassword && hasError && (
          <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
        )}
        {!isPassword && touched && isValid && !error && (
          <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Description and Error */}
      {description && !hasError && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || 'This field is required'}
        </p>
      )}
    </div>
  )
}

// Textarea Component
interface TextareaProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  autoResize?: boolean
}

export function Textarea({
  label,
  description,
  error,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  autoResize = false,
  className,
  touched = false,
  onValidation
}: TextareaProps) {
  const [isValid, setIsValid] = useState(true)

  const validateInput = useCallback((inputValue: string) => {
    const valid = !required || inputValue.trim().length > 0
    setIsValid(valid)
    onValidation?.(valid)
    return valid
  }, [required, onValidation])

  useEffect(() => {
    validateInput(value)
  }, [value, validateInput])

  const hasError = touched && (error || !isValid)

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={autoResize ? Math.max(rows, Math.ceil(value.length / 50)) : rows}
          maxLength={maxLength}
          className={cn(
            "block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "resize-y",
            {
              "border-gray-300": !hasError && !touched,
              "border-red-300 bg-red-50": hasError,
              "border-green-300 bg-green-50": touched && isValid && !error
            }
          )}
        />

        {/* Validation Icon */}
        {hasError && (
          <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
        )}
        {touched && isValid && !error && (
          <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Description and Error */}
      {description && !hasError && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || 'This field is required'}
        </p>
      )}
    </div>
  )
}

// Select Component
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  emptyOption?: string
}

export function Select({
  label,
  description,
  error,
  required = false,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  emptyOption,
  className,
  touched = false,
  onValidation
}: SelectProps) {
  const [isValid, setIsValid] = useState(true)

  const validateInput = useCallback((inputValue: string) => {
    const valid = !required || inputValue.length > 0
    setIsValid(valid)
    onValidation?.(valid)
    return valid
  }, [required, onValidation])

  useEffect(() => {
    validateInput(value)
  }, [value, validateInput])

  const hasError = touched && (error || !isValid)

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "appearance-none bg-white",
            {
              "border-gray-300": !hasError && !touched,
              "border-red-300 bg-red-50": hasError,
              "border-green-300 bg-green-50": touched && isValid && !error
            }
          )}
        >
          {emptyOption && (
            <option value="">{emptyOption}</option>
          )}
          {!emptyOption && !value && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Description and Error */}
      {description && !hasError && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || 'Please select an option'}
        </p>
      )}
    </div>
  )
}

// Date Input Component
interface DateInputProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

export function DateInput({
  label,
  description,
  error,
  required = false,
  value,
  onChange,
  min,
  max,
  className,
  touched = false,
  onValidation
}: DateInputProps) {
  const [isValid, setIsValid] = useState(true)

  const validateInput = useCallback((inputValue: string) => {
    let valid = true

    if (required && !inputValue) {
      valid = false
    }

    if (inputValue && min && inputValue < min) {
      valid = false
    }

    if (inputValue && max && inputValue > max) {
      valid = false
    }

    setIsValid(valid)
    onValidation?.(valid)
    return valid
  }, [required, min, max, onValidation])

  useEffect(() => {
    validateInput(value)
  }, [value, validateInput])

  const hasError = touched && (error || !isValid)

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={cn(
            "block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            {
              "border-gray-300": !hasError && !touched,
              "border-red-300 bg-red-50": hasError,
              "border-green-300 bg-green-50": touched && isValid && !error
            }
          )}
        />

        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Description and Error */}
      {description && !hasError && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || 'Please select a valid date'}
        </p>
      )}
    </div>
  )
}

// File Upload Component
interface FileUploadProps extends BaseInputProps {
  value: File | string | null
  onChange: (file: File | string | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: boolean
}

export function FileUpload({
  label,
  description,
  error,
  required = false,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  preview = true,
  className,
  touched = false,
  onValidation
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const validateInput = useCallback((inputValue: File | string | null) => {
    const valid = !required || inputValue !== null
    setIsValid(valid)
    onValidation?.(valid)
    return valid
  }, [required, onValidation])

  useEffect(() => {
    validateInput(value)
  }, [value, validateInput])

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return // File too large
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const hasError = touched && (error || !isValid)
  const hasFile = value !== null

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors duration-200",
          {
            "border-gray-300 hover:border-gray-400": !dragOver && !hasError,
            "border-indigo-400 bg-indigo-50": dragOver,
            "border-red-300 bg-red-50": hasError,
            "border-green-300 bg-green-50": hasFile && !hasError
          }
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="p-6 text-center">
          {hasFile && preview && typeof value === 'string' && value.startsWith('data:image') ? (
            <div className="space-y-3">
              <img
                src={value}
                alt="Preview"
                className="mx-auto h-32 w-auto rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>
                {' or drag and drop'}
              </div>
              <p className="text-xs text-gray-500">
                {accept} up to {maxSize}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description and Error */}
      {description && !hasError && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || 'Please upload a file'}
        </p>
      )}
    </div>
  )
}

// Checkbox Component
interface CheckboxProps extends BaseInputProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
}

export function Checkbox({
  label,
  description,
  error,
  checked,
  onChange,
  children,
  className,
  touched = false
}: CheckboxProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3">
          <label className="text-sm font-medium text-gray-700">
            {children}
          </label>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>

      {touched && error && (
        <p className="text-sm text-red-600 flex items-center ml-7">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  )
}