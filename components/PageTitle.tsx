import React from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-yellow-400 text-center drop-shadow-lg">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-gray-400 mt-2">{subtitle}</p>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
    </div>
  )
}