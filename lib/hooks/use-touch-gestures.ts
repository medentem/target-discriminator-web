"use client"

import { useEffect, useRef, useState } from "react"
import { UserResponse } from "@/lib/models/types"

interface TouchState {
  startX: number | null
  startY: number | null
  startTime: number | null
}

const SWIPE_THRESHOLD = 50 // pixels
const TAP_MAX_DURATION = 300 // milliseconds
const TAP_MAX_DISTANCE = 10 // pixels

export function useTouchGestures(
  onTap: () => void,
  onSwipe: (direction: "left" | "right") => void
) {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: null,
    startY: null,
    startTime: null,
  })
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let startX: number | null = null
    let startY: number | null = null
    let startTime: number | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX === null || startY === null || startTime === null) {
        return
      }

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const duration = Date.now() - startTime

      // Check for tap
      if (duration < TAP_MAX_DURATION && distance < TAP_MAX_DISTANCE) {
        onTap()
        startX = null
        startY = null
        startTime = null
        return
      }

      // Check for swipe
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        onSwipe(deltaX > 0 ? "right" : "left")
        startX = null
        startY = null
        startTime = null
        return
      }

      startX = null
      startY = null
      startTime = null
    }

    const handleMouseDown = (e: MouseEvent) => {
      startX = e.clientX
      startY = e.clientY
      startTime = Date.now()
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (startX === null || startY === null || startTime === null) {
        return
      }

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const duration = Date.now() - startTime

      // Check for tap (click)
      if (duration < TAP_MAX_DURATION && distance < TAP_MAX_DISTANCE) {
        onTap()
        startX = null
        startY = null
        startTime = null
        return
      }

      startX = null
      startY = null
      startTime = null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        onTap()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        onSwipe("left")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onSwipe("right")
      }
    }

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchend", handleTouchEnd)
    element.addEventListener("mousedown", handleMouseDown)
    element.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("mousedown", handleMouseDown)
      element.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onTap, onSwipe])

  return elementRef
}

