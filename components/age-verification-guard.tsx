"use client"

import { useEffect } from "react"
import { useAgeVerification } from "@/lib/hooks/use-age-verification"

interface AgeVerificationGuardProps {
  children: React.ReactNode
}

export function AgeVerificationGuard({ children }: AgeVerificationGuardProps) {
  const { isVerified, redirectToVerification } = useAgeVerification()

  useEffect(() => {
    if (isVerified === false) {
      redirectToVerification()
    }
  }, [isVerified, redirectToVerification])

  // Show nothing while checking verification status
  if (isVerified === null) {
    return null
  }

  // Only render children if verified
  if (isVerified === true) {
    return <>{children}</>
  }

  // If not verified, redirect will happen, show nothing
  return null
}

