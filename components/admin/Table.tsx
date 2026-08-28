'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * AdminTable — wrapper untuk tabel admin dengan styling konsisten:
 * - Sticky header (bg-stone-50)
 * - Dense rows (py-2.5)
 * - Subtle row hover
 * - Rounded container dengan border
 */
interface AdminTableProps {
  children: React.ReactNode
  className?: string
}

function AdminTableContainer({ children, className }: AdminTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-stone-200 bg-white',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  )
}

function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur-sm">
      {children}
    </thead>
  )
}

function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-stone-100">{children}</tbody>
}

function AdminTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-stone-50/70',
        className
      )}
    >
      {children}
    </tr>
  )
}

function AdminTableHeaderCell({
  children,
  align = 'left',
  className,
}: {
  children?: React.ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <th
      className={cn(
        'h-9 px-4 text-xs font-semibold uppercase tracking-wider text-stone-500',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  )
}

function AdminTableCell({
  children,
  align = 'left',
  className,
}: {
  children?: React.ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <td
      className={cn(
        'px-4 py-2.5 text-stone-700',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  )
}

export {
  AdminTableContainer as AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableHeaderCell,
  AdminTableCell,
}
