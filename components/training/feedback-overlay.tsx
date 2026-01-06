"use client"

import { ResponseResult } from "@/lib/models/response-result"
import { ThreatType, UserResponse } from "@/lib/models/types"

interface FeedbackOverlayProps {
  result: ResponseResult | null
  onAnimationComplete: () => void
}

export function FeedbackOverlay({ result, onAnimationComplete }: FeedbackOverlayProps) {
  if (!result) return null

  const isCorrect = result.isCorrect
  const message = isCorrect ? "Correct!" : "Incorrect"
  const threatLabel =
    result.actualThreatType === ThreatType.THREAT ? "Threat" : "Non-Threat"
  const responseLabel =
    result.userResponse === UserResponse.TAP ? "Tap (Threat)" : "Swipe (Non-Threat)"

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onAnimationComplete}
      onAnimationEnd={onAnimationComplete}
    >
      <div
        className={`rounded-lg p-8 text-center ${
          isCorrect ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <p className="text-4xl font-bold text-white">{message}</p>
        <p className="mt-4 text-xl text-white">
          Actual: {threatLabel} | Your Response: {responseLabel}
        </p>
        {result.reactionTimeMs !== null && (
          <p className="mt-2 text-sm text-white/80">
            Reaction Time: {(result.reactionTimeMs / 1000).toFixed(2)}s
          </p>
        )}
        <p className="mt-4 text-sm text-white/60">Tap anywhere to continue</p>
      </div>
    </div>
  )
}

