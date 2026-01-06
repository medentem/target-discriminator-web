"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTrainingSession } from "@/lib/hooks/use-training-session"
import { useTouchGestures } from "@/lib/hooks/use-touch-gestures"
import { MediaDisplay } from "@/components/training/media-display"
import { FeedbackOverlay } from "@/components/training/feedback-overlay"
import { TapIndicator } from "@/components/training/tap-indicator"
import { UserResponse, MediaType } from "@/lib/models/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function TrainingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [nextMediaUrl, setNextMediaUrl] = useState<string | null>(null)
  const [tapIndicators, setTapIndicators] = useState<Array<{ id: number; x: number; y: number }>>([])
  const tapIndicatorIdRef = useRef(0)
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const handleFeedbackShownRef = useRef<(() => void) | null>(null)

  const includeVideos = searchParams.get("videos") === "true"
  const includePhotos = searchParams.get("photos") === "true"
  const durationMinutes = parseInt(searchParams.get("duration") || "5", 10)

  const handleSessionComplete = () => {
    router.push("/session-config")
  }

  const {
    state,
    handleUserResponse,
    handleFeedbackShown,
    handleVideoCompleted,
    stopSession,
    getMediaUrl,
    getNextMediaItem,
  } = useTrainingSession(
    includeVideos,
    includePhotos,
    durationMinutes,
    handleSessionComplete
  )

  // Load media URL when current media changes
  useEffect(() => {
    if (state.currentMedia) {
      getMediaUrl(state.currentMedia)
        .then((url) => setMediaUrl(url))
        .catch((e) => {
          console.error("Failed to load media:", e)
          setMediaUrl(null)
        })
    } else {
      setMediaUrl(null)
    }
  }, [state.currentMedia, getMediaUrl])

  // Preload next video URL when current media is shown
  useEffect(() => {
    if (!state.isSessionComplete && state.currentMedia) {
      // Preload the next video after a short delay to let current media start loading
      const preloadTimer = setTimeout(() => {
        const nextMedia = getNextMediaItem()
        if (nextMedia && nextMedia.type === MediaType.VIDEO) {
          getMediaUrl(nextMedia)
            .then((url) => setNextMediaUrl(url))
            .catch((e) => {
              console.error("Failed to preload next media:", e)
              setNextMediaUrl(null)
            })
        } else {
          setNextMediaUrl(null)
        }
      }, 500) // Small delay to prioritize current media loading

      return () => clearTimeout(preloadTimer)
    } else {
      setNextMediaUrl(null)
    }
  }, [state.currentMedia, state.isSessionComplete, getNextMediaItem, getMediaUrl])

  // Keep the ref updated with the latest callback
  useEffect(() => {
    handleFeedbackShownRef.current = handleFeedbackShown
  }, [handleFeedbackShown])

  // Auto-advance after feedback is shown
  useEffect(() => {
    // Clear any existing timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    if (state.showFeedback && state.lastResult && !state.isSessionComplete && handleFeedbackShownRef.current) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        if (handleFeedbackShownRef.current) {
          handleFeedbackShownRef.current()
        }
        autoAdvanceTimerRef.current = null
      }, 1000) // Auto-advance after 1 second
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
        autoAdvanceTimerRef.current = null
      }
    }
  }, [state.showFeedback, state.lastResult, state.isSessionComplete])

  const handleTap = (x: number, y: number) => {
    // Only show tap indicator when media is active and waiting for response
    if (!state.showFeedback && !state.hasResponded && state.currentMedia) {
      // Convert viewport coordinates to container-relative coordinates
      if (gestureRef.current) {
        const rect = gestureRef.current.getBoundingClientRect()
        const relativeX = x - rect.left
        const relativeY = y - rect.top

        // Show tap indicator
        const id = tapIndicatorIdRef.current++
        setTapIndicators((prev) => [...prev, { id, x: relativeX, y: relativeY }])
      }
    }

    if (!state.hasResponded) {
      handleUserResponse(UserResponse.TAP)
    }
  }

  const handleTapIndicatorComplete = (id: number) => {
    setTapIndicators((prev) => prev.filter((indicator) => indicator.id !== id))
  }

  const handleSwipe = () => {
    if (!state.hasResponded) {
      handleUserResponse(UserResponse.SWIPE)
    }
  }

  const gestureRef = useTouchGestures(handleTap, handleSwipe)

  const handleBack = () => {
    stopSession()
    router.push("/session-config")
  }

  const handleContinueAfterStats = () => {
    router.push("/session-config")
  }

  const getAverageReactionTime = (): number | null => {
    if (state.reactionTimesMs.length === 0) return null
    const sum = state.reactionTimesMs.reduce((a, b) => a + b, 0)
    return Math.round(sum / state.reactionTimesMs.length)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/80 p-4 text-white">
        <Button variant="ghost" onClick={handleBack} className="text-white">
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            {formatTime(state.timeRemainingSeconds)}
          </div>
          <div className="text-sm">
            Score: {state.correctResponses}/{state.totalResponses}
          </div>
        </div>
      </div>

      {/* Stats Display Overlay */}
      {state.isSessionComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Session Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <div className="text-lg">
                  <span className="font-semibold">Correct:</span> {state.correctResponses}
                </div>
                <div className="text-lg">
                  <span className="font-semibold">Incorrect:</span> {state.totalResponses - state.correctResponses}
                </div>
                <div className="text-lg">
                  <span className="font-semibold">Total:</span> {state.totalResponses}
                </div>
                <div className="text-lg">
                  <span className="font-semibold">Accuracy:</span>{" "}
                  {state.totalResponses > 0
                    ? `${Math.round((state.correctResponses / state.totalResponses) * 100)}%`
                    : "0%"}
                </div>
                {getAverageReactionTime() !== null && (
                  <div className="text-lg">
                    <span className="font-semibold">Average Response Time:</span>{" "}
                    {(getAverageReactionTime()! / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
              <Button
                onClick={handleContinueAfterStats}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Display */}
      <div
        ref={gestureRef}
        className="relative flex-1 touch-none select-none"
      >
        <MediaDisplay
          mediaItem={state.currentMedia}
          mediaUrl={mediaUrl}
          nextMediaUrl={nextMediaUrl}
          onVideoCompleted={handleVideoCompleted}
        />

        {/* Tap Indicators */}
        {tapIndicators.map((indicator) => (
          <TapIndicator
            key={indicator.id}
            x={indicator.x}
            y={indicator.y}
            onComplete={() => handleTapIndicatorComplete(indicator.id)}
          />
        ))}

        {/* Feedback Banner - Overlay */}
        {state.showFeedback && state.lastResult && !state.isSessionComplete && (
          <FeedbackOverlay
            result={state.lastResult}
            onAnimationComplete={handleFeedbackShown}
          />
        )}
      </div>

      {/* Instructions */}
      {!state.isSessionComplete && (
        <div className={`bg-black/80 p-4 text-center text-white transition-opacity ${
          state.showFeedback ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}>
          <p className="text-sm">
            Tap for Threat | Swipe for Non-Threat
          </p>
          <p className="mt-1 text-xs text-white/60">
            (Space/Enter = Tap, Arrow Keys = Swipe)
          </p>
        </div>
      )}
    </div>
  )
}

export default function TrainingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading training session...</p>
      </div>
    }>
      <TrainingPageContent />
    </Suspense>
  )
}
