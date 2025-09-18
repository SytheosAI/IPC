'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormWizardStep {
  id: string
  title: string
  description?: string
  isValid?: boolean
  isOptional?: boolean
  component: React.ComponentType<any>
}

interface FormWizardContextType {
  currentStep: number
  totalSteps: number
  steps: FormWizardStep[]
  goToStep: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  canProceed: boolean
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
  markStepValid: (stepIndex: number, isValid: boolean) => void
  autoSave: boolean
  lastSaved?: Date
}

const FormWizardContext = createContext<FormWizardContextType | null>(null)

export const useFormWizard = () => {
  const context = useContext(FormWizardContext)
  if (!context) {
    throw new Error('useFormWizard must be used within FormWizard')
  }
  return context
}

interface FormWizardProps {
  steps: FormWizardStep[]
  initialData?: Record<string, any>
  onStepChange?: (stepIndex: number) => void
  onComplete?: (data: Record<string, any>) => void
  autoSave?: boolean
  onAutoSave?: (data: Record<string, any>) => void
  className?: string
  children?: React.ReactNode
}

export function FormWizard({
  steps,
  initialData = {},
  onStepChange,
  onComplete,
  autoSave = true,
  onAutoSave,
  className,
  children
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialData)
  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>({})
  const [lastSaved, setLastSaved] = useState<Date>()

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }, [steps.length, onStepChange])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    } else if (currentStep === steps.length - 1) {
      onComplete?.(formData)
    }
  }, [currentStep, steps.length, formData, goToStep, onComplete])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const updateFormData = useCallback((data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...data }))

    if (autoSave && onAutoSave) {
      // Debounced auto-save
      const timeoutId = setTimeout(() => {
        onAutoSave({ ...formData, ...data })
        setLastSaved(new Date())
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [formData, autoSave, onAutoSave])

  const markStepValid = useCallback((stepIndex: number, isValid: boolean) => {
    setStepValidations(prev => ({ ...prev, [stepIndex]: isValid }))
  }, [])

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const canProceed = stepValidations[currentStep] ?? currentStepData?.isOptional ?? false

  const contextValue: FormWizardContextType = {
    currentStep,
    totalSteps: steps.length,
    steps,
    goToStep,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    canProceed,
    formData,
    updateFormData,
    markStepValid,
    autoSave,
    lastSaved
  }

  return (
    <FormWizardContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </FormWizardContext.Provider>
  )
}

// Progress Indicator Component
export function FormProgress() {
  const { currentStep, totalSteps, steps } = useFormWizard()
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-indigo-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-indigo-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                    {
                      "bg-indigo-600 border-indigo-600 text-white": isActive,
                      "bg-green-600 border-green-600 text-white": isCompleted,
                      "bg-gray-100 border-gray-300 text-gray-500": isUpcoming
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all duration-200",
                      {
                        "bg-green-600": isCompleted,
                        "bg-indigo-300": isActive,
                        "bg-gray-200": isUpcoming
                      }
                    )}
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    {
                      "text-indigo-600": isActive,
                      "text-green-600": isCompleted,
                      "text-gray-500": isUpcoming
                    }
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Step Container Component
interface FormStepProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function FormStep({ children, title, description, className }: FormStepProps) {
  return (
    <div className={cn("w-full", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

// Navigation Controls Component
export function FormNavigation() {
  const { previousStep, nextStep, isFirstStep, isLastStep, canProceed } = useFormWizard()

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={previousStep}
        disabled={isFirstStep}
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
          {
            "text-gray-400 cursor-not-allowed": isFirstStep,
            "text-gray-700 hover:text-gray-900 hover:bg-gray-50": !isFirstStep
          }
        )}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>

      <button
        type="button"
        onClick={nextStep}
        disabled={!canProceed}
        className={cn(
          "flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          {
            "bg-gray-300 text-gray-500 cursor-not-allowed": !canProceed,
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl": canProceed
          }
        )}
      >
        {isLastStep ? (
          <>
            <Save className="h-4 w-4 mr-2" />
            Complete
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        )}
      </button>
    </div>
  )
}

// Auto-save Indicator Component
export function AutoSaveIndicator() {
  const { autoSave, lastSaved } = useFormWizard()

  if (!autoSave) return null

  return (
    <div className="flex items-center text-sm text-gray-500">
      <div className="flex items-center space-x-1">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <span>
          {lastSaved
            ? `Last saved at ${lastSaved.toLocaleTimeString()}`
            : 'Auto-save enabled'
          }
        </span>
      </div>
    </div>
  )
}

// Field Group Component for organizing form sections
interface FieldGroupProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  required?: boolean
  className?: string
}

export function FieldGroup({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  required = false,
  className
}: FieldGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className={cn("border border-gray-200 rounded-lg", className)}>
      <div
        className={cn(
          "px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg",
          { "cursor-pointer hover:bg-gray-100": collapsible }
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 flex items-center">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <ChevronRight
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform duration-200",
                { "rotate-90": !isCollapsed }
              )}
            />
          )}
        </div>
      </div>

      {(!collapsible || !isCollapsed) && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}