"use client"

import { ResponseResult } from "@/lib/models/response-result"
import { ThreatType, UserResponse } from "@/lib/models/types"
import { useThreatLabels, getThreatLabel } from "@/lib/hooks/use-threat-labels"

interface FeedbackOverlayProps {
  result: ResponseResult | null
  onAnimationComplete: () => void
}

export function FeedbackOverlay({ result, onAnimationComplete }: FeedbackOverlayProps) {
  const labels = useThreatLabels()
  
  if (!result) return null

  const isCorrect = result.isCorrect
  const message = isCorrect ? "Correct!" : "Incorrect"
  const threatLabel = getThreatLabel(result.actualThreatType, labels)
  const responseLabel = result.userResponse === UserResponse.TAP ? labels.threat : labels.nonThreat

  return (
    <div
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className={`w-full max-w-2xl rounded-lg p-6 text-center shadow-lg backdrop-blur-sm opacity-80 ${
          isCorrect ? "bg-green-600/90" : "bg-red-600/90"
        }`}
      >
        <p className="text-3xl font-bold text-white">{message}</p>
        <p className="mt-2 text-lg text-white">
          Actual: {threatLabel} | Your Response: {responseLabel}
        </p>
        {result.reactionTimeMs !== null && (
          <p className="mt-1 text-sm text-white/80">
            Reaction Time: {(result.reactionTimeMs / 1000).toFixed(2)}s
          </p>
        )}
      </div>
    </div>
  )
}

