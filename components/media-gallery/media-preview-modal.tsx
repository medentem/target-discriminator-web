"use client"

import { useEffect, useRef, useState } from "react"
import { MediaItem } from "@/lib/models/media-item"
import { MediaType } from "@/lib/models/types"
import { MediaRepository } from "@/lib/repositories/media-repository"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MediaPreviewModalProps {
  mediaItem: MediaItem | null
  allMediaItems: MediaItem[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate?: (index: number) => void
}

export function MediaPreviewModal({
  mediaItem,
  allMediaItems,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: MediaPreviewModalProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRepository = useRef(new MediaRepository())

  useEffect(() => {
    if (!isOpen || !mediaItem) {
      setMediaUrl(null)
      setIsLoading(true)
      setImageError(false)
      return
    }

    let objectUrl: string | null = null

    const loadMedia = async () => {
      try {
        setIsLoading(true)
        setImageError(false)
        const url = await mediaRepository.current.getMediaUrl(mediaItem)
        setMediaUrl(url)
      } catch (e) {
        console.error("Failed to load media:", e)
        setImageError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadMedia()

    return () => {
      if (objectUrl && mediaItem.path.startsWith("indexeddb://")) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [isOpen, mediaItem])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft" && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1)
      } else if (
        e.key === "ArrowRight" &&
        onNavigate &&
        currentIndex < allMediaItems.length - 1
      ) {
        onNavigate(currentIndex + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, allMediaItems.length, onNavigate, onClose])

  // Auto-play video when opened
  useEffect(() => {
    if (isOpen && mediaItem?.type === MediaType.VIDEO && videoRef.current && mediaUrl) {
      videoRef.current.play().catch((e) => {
        console.error("Failed to play video:", e)
      })
    }
  }, [isOpen, mediaItem, mediaUrl])

  if (!isOpen || !mediaItem) return null

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < allMediaItems.length - 1

  const handlePrevious = () => {
    if (canGoPrevious && onNavigate) {
      onNavigate(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext && onNavigate) {
      onNavigate(currentIndex + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Button>

      {/* Navigation buttons */}
      {allMediaItems.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-4 z-10 text-white hover:bg-white/20",
              !canGoPrevious && "opacity-50 cursor-not-allowed"
            )}
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            disabled={!canGoPrevious}
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-4 z-10 text-white hover:bg-white/20",
              !canGoNext && "opacity-50 cursor-not-allowed"
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            disabled={!canGoNext}
            aria-label="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
        </>
      )}

      {/* Media content */}
      <div
        className="relative h-full w-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="text-white">Loading...</div>
        ) : imageError ? (
          <div className="text-white">Failed to load media</div>
        ) : mediaUrl ? (
          mediaItem.type === MediaType.VIDEO ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-h-full max-w-full object-contain"
              controls
              autoPlay
              muted
              playsInline
            />
          ) : (
            <Image
              src={mediaUrl}
              alt="Media preview"
              width={1920}
              height={1080}
              className="max-h-full max-w-full object-contain"
              unoptimized
              priority
            />
          )
        ) : null}
      </div>

      {/* Media info footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 rounded-md px-4 py-2 text-white text-sm">
        {allMediaItems.length > 1 && (
          <span className="mr-4">
            {currentIndex + 1} / {allMediaItems.length}
          </span>
        )}
        <span className="capitalize">{mediaItem.type.toLowerCase()}</span>
      </div>
    </div>
  )
}
