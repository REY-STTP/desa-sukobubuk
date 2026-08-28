'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
  /** Label text di atas input */
  label: string
  /** Required indicator (tanda *) */
  required?: boolean
  /** Helper text di bawah input (selalu tampil) */
  hint?: string
  /** Error message (kalau ada, ganti hint) */
  error?: string
  /** Icon di sebelah kiri input (optional) */
  icon?: React.ReactNode
  /** Class tambahan untuk wrapper */
  className?: string
  /** Children = input element */
  children: React.ReactNode
}

export function FormField({
  label,
  required = false,
  hint,
  error,
  icon,
  className,
  children,
}: FormFieldProps) {
  const id = React.useId()
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint && !error ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-700"
      >
        {label}
        {required && <span className="ml-0.5 text-ember-600">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </div>
        )}
        {React.Children.toArray(children).map((child, idx) => {
          if (!React.isValidElement(child)) return child
          // Only inject field props into the first element (the input).
          // Skip button addons like eye-toggle.
          const isFirst = idx === 0
          if (!isFirst) return child
          return React.cloneElement(child as React.ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string; className?: string }>, {
            id,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
            className: cn(
              icon && 'pl-10',
              error && 'border-ember-500 focus-visible:ring-ember-500/30',
              (child.props as { className?: string }).className
            ),
          })
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-ember-700">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** Form section header */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <header>
        <h2 className="font-display text-base font-medium text-stone-800">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/** Form actions row (submit + cancel) */
export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2',
        className
      )}
    >
      {children}
    </div>
  )
}
