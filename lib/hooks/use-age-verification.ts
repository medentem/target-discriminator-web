"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LocalStorageService } from "@/lib/storage/local-storage"

export function useAgeVerification() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const verified = LocalStorageService.isAgeVerified()
    setIsVerified(verified)
  }, [])

  const setAgeVerified = (verified: boolean) => {
    LocalStorageService.setAgeVerified(verified)
    setIsVerified(verified)
  }

  const redirectToVerification = () => {
    router.push("/")
  }

  return {
    isVerified,
    setAgeVerified,
    redirectToVerification,
  }
}

