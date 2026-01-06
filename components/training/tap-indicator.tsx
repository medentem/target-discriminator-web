"use client"

import { useEffect, useState } from "react"

interface TapIndicatorProps {
  x: number
  y: number
  onComplete: () => void
}

export function TapIndicator({ x, y, onComplete }: TapIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 10)

    // Remove after animation completes
    const removeTimer = setTimeout(() => {
      onComplete()
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [onComplete])

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        width: "48px",
        height: "48px",
      }}
    >
      <div
        className={`h-full w-full rounded-full border-4 border-white transition-all duration-1000 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-200"
        }`}
      />
    </div>
  )
}

