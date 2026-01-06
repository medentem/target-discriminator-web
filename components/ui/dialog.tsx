"use client"

import { ReactNode } from "react"
import { Button } from "./button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DialogContentProps {
  children: ReactNode
  title?: string
  description?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export function DialogContent({
  children,
  title,
  description,
}: DialogContentProps) {
  return (
    <div className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
      {title && (
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      )}
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex justify-end gap-2">{children}</div>
  )
}

