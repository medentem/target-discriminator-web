"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MediaItem } from "@/lib/models/media-item"
import { ResponseResult } from "@/lib/models/response-result"
import { SessionStats } from "@/lib/models/session-stats"
import { ThreatType, UserResponse, MediaType } from "@/lib/models/types"
import { MediaRepository } from "@/lib/repositories/media-repository"
import { SessionStatsRepository } from "@/lib/repositories/session-stats-repository"

interface TrainingState {
  isPlaying: boolean
  currentMedia: MediaItem | null
  timeRemainingSeconds: number
  totalResponses: number
  correctResponses: number
  showFeedback: boolean
  lastResult: ResponseResult | null
  hasResponded: boolean
  reactionTimesMs: number[]
  isSessionComplete: boolean
}

const initialState: TrainingState = {
  isPlaying: false,
  currentMedia: null,
  timeRemainingSeconds: 0,
  totalResponses: 0,
  correctResponses: 0,
  showFeedback: false,
  lastResult: null,
  hasResponded: false,
  reactionTimesMs: [],
  isSessionComplete: false,
}

export function useTrainingSession(
  includeVideos: boolean,
  includePhotos: boolean,
  durationMinutes: number,
  onSessionComplete: () => void
) {
  const [state, setState] = useState<TrainingState>(initialState)
  const mediaRepository = useRef(new MediaRepository())
  const statsRepository = useRef(new SessionStatsRepository())
  const availableMedia = useRef<MediaItem[]>([])
  const shownMediaPaths = useRef<Set<string>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const currentMediaStartTime = useRef<number | null>(null)
  const isShowingNextMedia = useRef(false)

  const getAverageReactionTime = useCallback((times: number[]): number | null => {
    if (times.length === 0) return null
    const sum = times.reduce((a, b) => a + b, 0)
    return Math.round(sum / times.length)
  }, [])

  const calculateReactionTime = useCallback((
    isCorrect: boolean,
    userResponse: UserResponse,
    actualThreatType: ThreatType,
    mediaType: MediaType
  ): number | null => {
    if (!isCorrect) return null

    const isThreatTap = userResponse === UserResponse.TAP && actualThreatType === ThreatType.THREAT
    const isNonThreatPhotoSwipe =
      userResponse === UserResponse.SWIPE &&
      actualThreatType === ThreatType.NON_THREAT &&
      mediaType === MediaType.PHOTO

    if (!isThreatTap && !isNonThreatPhotoSwipe) return null

    const startTime = currentMediaStartTime.current
    if (!startTime) return null

    const reactionTime = Date.now() - startTime
    return reactionTime > 0 ? reactionTime : null
  }, [])

  const getNextMediaItem = useCallback((): MediaItem | null => {
    if (availableMedia.current.length === 0) return null

    const unshownMedia = availableMedia.current.filter(
      (m) => !shownMediaPaths.current.has(m.path)
    )

    const mediaToChooseFrom =
      unshownMedia.length === 0
        ? availableMedia.current
        : unshownMedia

    if (mediaToChooseFrom.length === 0) return null

    // Pick a random one (same logic as showNextMedia but without side effects)
    const randomIndex = Math.floor(Math.random() * mediaToChooseFrom.length)
    return mediaToChooseFrom[randomIndex]
  }, [])

  const showNextMedia = useCallback(() => {
    if (isShowingNextMedia.current || availableMedia.current.length === 0) return

    isShowingNextMedia.current = true

    const unshownMedia = availableMedia.current.filter(
      (m) => !shownMediaPaths.current.has(m.path)
    )

    const mediaToChooseFrom =
      unshownMedia.length === 0
        ? (shownMediaPaths.current.clear(), availableMedia.current)
        : unshownMedia

    const randomIndex = Math.floor(Math.random() * mediaToChooseFrom.length)
    const nextMedia = mediaToChooseFrom[randomIndex]

    shownMediaPaths.current.add(nextMedia.path)
    currentMediaStartTime.current = Date.now()

    setState((prev) => ({
      ...prev,
      currentMedia: nextMedia,
      hasResponded: false,
    }))

    isShowingNextMedia.current = false
  }, [])

  const handleUserResponse = useCallback(
    (userResponse: UserResponse) => {
      setState((prev) => {
        if (prev.hasResponded || !prev.currentMedia) return prev

        const currentMedia = prev.currentMedia!
        const expectedThreatType =
          userResponse === UserResponse.TAP ? ThreatType.THREAT : ThreatType.NON_THREAT
        const isCorrect = currentMedia.threatType === expectedThreatType

        const reactionTimeMs = calculateReactionTime(
          isCorrect,
          userResponse,
          currentMedia.threatType,
          currentMedia.type
        )

        const result: ResponseResult = {
          isCorrect,
          userResponse,
          actualThreatType: currentMedia.threatType,
          reactionTimeMs,
        }

        const updatedReactionTimes = reactionTimeMs
          ? [...prev.reactionTimesMs, reactionTimeMs]
          : prev.reactionTimesMs

        return {
          ...prev,
          showFeedback: true,
          lastResult: result,
          totalResponses: prev.totalResponses + 1,
          correctResponses: isCorrect ? prev.correctResponses + 1 : prev.correctResponses,
          hasResponded: true,
          reactionTimesMs: updatedReactionTimes,
        }
      })

      currentMediaStartTime.current = null
    },
    [calculateReactionTime]
  )

  const handleFeedbackShown = useCallback(() => {
    setState((prev) => {
      if (prev.isSessionComplete) {
        onSessionComplete()
        return prev
      }

      return { ...prev, showFeedback: false }
    })

    // Show next media after a brief delay
    setTimeout(() => {
      showNextMedia()
    }, 100)
  }, [onSessionComplete, showNextMedia])

  const handleVideoCompleted = useCallback(() => {
    setState((prev) => {
      if (prev.hasResponded || !prev.currentMedia) return prev

      const currentMedia = prev.currentMedia!
      if (
        currentMedia.type === MediaType.VIDEO &&
        currentMedia.threatType === ThreatType.NON_THREAT
      ) {
        const result: ResponseResult = {
          isCorrect: true,
          userResponse: UserResponse.SWIPE,
          actualThreatType: ThreatType.NON_THREAT,
          reactionTimeMs: null,
        }

        return {
          ...prev,
          showFeedback: true,
          lastResult: result,
          totalResponses: prev.totalResponses + 1,
          correctResponses: prev.correctResponses + 1,
          hasResponded: true,
        }
      }

      return prev
    })

    currentMediaStartTime.current = null
  }, [])

  const saveSessionStats = useCallback(
    async (finalState: TrainingState) => {
      try {
        const averageReactionTimeMs = getAverageReactionTime(finalState.reactionTimesMs)
        const stats: SessionStats = {
          id: 0,
          timestamp: Date.now(),
          totalResponses: finalState.totalResponses,
          correctResponses: finalState.correctResponses,
          averageReactionTimeMs,
        }
        await statsRepository.current.saveSessionStats(stats)
      } catch (e) {
        console.error("Failed to save session stats:", e)
      }
    },
    [getAverageReactionTime]
  )

  const initializeSession = useCallback(async () => {
    try {
      const media = await mediaRepository.current.getMediaItems(
        includeVideos,
        includePhotos
      )

      if (media.length === 0) {
        // No media available, redirect back
        onSessionComplete()
        return
      }

      availableMedia.current = media
      shownMediaPaths.current.clear()

      const durationSeconds = durationMinutes * 60

      setState({
        ...initialState,
        isPlaying: true,
        timeRemainingSeconds: durationSeconds,
      })

      // Start timer
      let remaining = durationSeconds
      timerRef.current = setInterval(() => {
        remaining--
        setState((prev) => ({
          ...prev,
          timeRemainingSeconds: remaining,
        }))

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }

          setState((prev) => {
            const finalState = {
              ...prev,
              isPlaying: false,
              isSessionComplete: true,
            }
            saveSessionStats(finalState)
            return finalState
          })
        }
      }, 1000)

      // Show first media
      showNextMedia()
    } catch (e) {
      console.error("Failed to initialize session:", e)
      onSessionComplete()
    }
  }, [includeVideos, includePhotos, durationMinutes, onSessionComplete, saveSessionStats, showNextMedia])

  const stopSession = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const currentState = state
    if (currentState.totalResponses > 0) {
      await saveSessionStats(currentState)
    }
  }, [state, saveSessionStats])

  useEffect(() => {
    initializeSession()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return {
    state,
    handleUserResponse,
    handleFeedbackShown,
    handleVideoCompleted,
    stopSession,
    getMediaUrl: (mediaItem: MediaItem) => mediaRepository.current.getMediaUrl(mediaItem),
    getNextMediaItem,
  }
}

