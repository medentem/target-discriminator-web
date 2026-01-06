"use client"

import { useState, useEffect } from "react"

export function useAndroidDetection() {
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsAndroid(/android/.test(userAgent))
    }
  }, [])

  return isAndroid
}

