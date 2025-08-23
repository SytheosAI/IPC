import React from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-6 relative">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50"></div>
    </div>
  )
}