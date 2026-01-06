"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTrainingSession } from "@/lib/hooks/use-training-session"
import { useTouchGestures } from "@/lib/hooks/use-touch-gestures"
import { useRef } from "react"
import { MediaDisplay } from "@/components/training/media-display"
import { FeedbackOverlay } from "@/components/training/feedback-overlay"
import { UserResponse } from "@/lib/models/types"
import { Button } from "@/components/ui/button"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function TrainingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)

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

  const handleTap = () => {
    if (!state.hasResponded) {
      handleUserResponse(UserResponse.TAP)
    }
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

      {/* Media Display */}
      <div
        ref={gestureRef}
        className="relative flex-1 touch-none select-none"
      >
        <MediaDisplay
          mediaItem={state.currentMedia}
          mediaUrl={mediaUrl}
          onVideoCompleted={handleVideoCompleted}
        />

        {state.showFeedback && state.lastResult && (
          <FeedbackOverlay
            result={state.lastResult}
            onAnimationComplete={handleFeedbackShown}
          />
        )}
      </div>

      {/* Instructions */}
      {!state.showFeedback && (
        <div className="bg-black/80 p-4 text-center text-white">
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

