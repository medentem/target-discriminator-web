"use client"

import { useEffect } from "react"
import { useAgeVerification } from "@/lib/hooks/use-age-verification"

interface AgeVerificationGuardProps {
  children: React.ReactNode
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 space-y-4 animate-pulse">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
              <div className="h-6 w-11 bg-muted rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
              <div className="h-6 w-11 bg-muted rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/6"></div>
              </div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AgeVerificationGuard({ children }: AgeVerificationGuardProps) {
  const { isVerified, redirectToVerification } = useAgeVerification()

  useEffect(() => {
    if (isVerified === false) {
      redirectToVerification()
    }
  }, [isVerified, redirectToVerification])

  // Show loading skeleton while checking verification status to prevent CLS
  if (isVerified === null) {
    return <LoadingSkeleton />
  }

  // Only render children if verified
  if (isVerified === true) {
    return <>{children}</>
  }

  // If not verified, redirect will happen, show loading skeleton
  return <LoadingSkeleton />
}

