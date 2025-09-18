'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ReportFormSectionProps {
  title: string
  description?: string
  color?: 'blue' | 'red' | 'orange' | 'green' | 'purple'
  children: React.ReactNode
  className?: string
}

const colorClasses = {
  blue: 'text-blue-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  green: 'text-green-600',
  purple: 'text-purple-600'
}

export function ReportFormSection({
  title,
  description,
  color = 'blue',
  children,
  className
}: ReportFormSectionProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6", className)}>
      <div className="mb-4">
        <h2 className={cn("text-lg font-semibold mb-1", colorClasses[color])}>
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
  description?: string
  className?: string
}

export function FormField({ label, children, required, description, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  highlight?: boolean
}

export function TextInput({ highlight, className, ...props }: TextInputProps) {
  return (
    <div className={cn(highlight && "bg-yellow-50 p-3 rounded")}>
      <input
        type="text"
        className={cn(
          "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          className
        )}
        {...props}
      />
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  highlight?: boolean
}

export function TextArea({ highlight, className, ...props }: TextAreaProps) {
  return (
    <div className={cn(highlight && "bg-yellow-50 p-3 rounded")}>
      <textarea
        className={cn(
          "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          className
        )}
        {...props}
      />
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  highlight?: boolean
}

export function Select({ highlight, className, children, ...props }: SelectProps) {
  return (
    <div className={cn(highlight && "bg-yellow-50 p-3 rounded")}>
      <select
        className={cn(
          "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function ReadOnlyField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("bg-gray-50 p-3 rounded", className)}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-gray-900">{value || '-'}</p>
    </div>
  )
}