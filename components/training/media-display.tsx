"use client"

import { useEffect, useRef, useState } from "react"
import { MediaItem } from "@/lib/models/media-item"
import { MediaType } from "@/lib/models/types"
import Image from "next/image"

interface MediaDisplayProps {
  mediaItem: MediaItem | null
  mediaUrl: string | null
  onVideoCompleted: () => void
}

export function MediaDisplay({ mediaItem, mediaUrl, onVideoCompleted }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (mediaItem?.type === MediaType.VIDEO && videoRef.current && mediaUrl) {
      const video = videoRef.current
      video.load()
      video.play().catch((e) => {
        console.error("Failed to play video:", e)
      })
    }
  }, [mediaItem, mediaUrl])

  if (!mediaItem || !mediaUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (mediaItem.type === MediaType.VIDEO) {
    return (
      <video
        ref={videoRef}
        src={mediaUrl}
        className="h-full w-full object-contain"
        onEnded={onVideoCompleted}
        playsInline
        muted
      />
    )
  }

  return (
    <div className="relative h-full w-full bg-black">
      {!imageError ? (
        <Image
          src={mediaUrl}
          alt="Training media"
          fill
          className="object-contain"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-white">Failed to load image</p>
        </div>
      )}
    </div>
  )
}

