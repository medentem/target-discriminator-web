"use client"

import { useState, useEffect } from "react"
import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { MediaOverride } from "@/lib/models/media-override"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IndexedDBService } from "@/lib/storage/indexed-db"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface MediaItemCardProps {
  mediaItem: MediaItem
  override?: MediaOverride
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onExclude?: () => void
  onInclude?: () => void
  onReclassify?: () => void
}

export function MediaItemCard({
  mediaItem,
  override,
  isSelected = false,
  onSelect,
  onExclude,
  onInclude,
  onReclassify,
}: MediaItemCardProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const isExcluded = override?.isExcluded || false
  const hasThreatOverride = override?.threatTypeOverride !== undefined
  const displayThreatType = override?.threatTypeOverride || mediaItem.threatType
  const isBuiltIn = !mediaItem.path.startsWith("indexeddb://")

  useEffect(() => {
    let objectUrl: string | null = null

    if (mediaItem.path.startsWith("indexeddb://")) {
      IndexedDBService.getMediaFile(mediaItem.path)
        .then((file) => {
          if (file) {
            objectUrl = URL.createObjectURL(file)
            setMediaUrl(objectUrl)
          }
        })
        .catch((e) => {
          console.error("Failed to load media:", e)
        })
    } else {
      // Built-in media
      setMediaUrl(mediaItem.path.startsWith("/") ? mediaItem.path : `/${mediaItem.path}`)
    }

    return () => {
      if (objectUrl && mediaItem.path.startsWith("indexeddb://")) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [mediaItem.path])

  const getThreatBadgeColor = () => {
    if (displayThreatType === ThreatType.THREAT) {
      return "bg-destructive/20 text-destructive border-destructive/50"
    }
    return "bg-green-600/20 text-green-600 border-green-600/50"
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isExcluded && "opacity-50",
        isSelected && "ring-2 ring-primary",
        isHovered && "scale-[1.02] shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Selection checkbox */}
        {onSelect && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Media preview */}
        <div className="relative aspect-video bg-black">
          {mediaUrl ? (
            mediaItem.type === MediaType.VIDEO ? (
              <video
                src={mediaUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <Image
                src={mediaUrl}
                alt="Media preview"
                fill
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              Loading...
            </div>
          )}

          {/* Excluded overlay */}
          {isExcluded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white">
                🚫 EXCLUDED
              </div>
            </div>
          )}

          {/* Action buttons on hover */}
          {isHovered && !isExcluded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60">
              {onExclude && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onExclude()
                  }}
                >
                  Exclude
                </Button>
              )}
              {onReclassify && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReclassify()
                  }}
                >
                  Reclassify
                </Button>
              )}
            </div>
          )}

          {/* Include button if excluded */}
          {isHovered && isExcluded && onInclude && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation()
                  onInclude()
                }}
              >
                Include
              </Button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold",
                  getThreatBadgeColor()
                )}
              >
                {displayThreatType === ThreatType.THREAT ? "THREAT" : "NON-THREAT"}
              </span>
              {hasThreatOverride && (
                <span className="rounded-md bg-orange-600/20 text-orange-600 border border-orange-600/50 px-2 py-0.5 text-xs font-semibold">
                  OVERRIDDEN
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {mediaItem.type}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isBuiltIn ? "Built-in" : "User"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
