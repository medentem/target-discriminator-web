"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { UserMediaRepository } from "@/lib/repositories/user-media-repository"
import { IndexedDBService } from "@/lib/storage/indexed-db"
import Image from "next/image"

export default function MediaManagementPage() {
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | "ALL">("ALL")
  const [selectedThreatType, setSelectedThreatType] = useState<ThreatType | "ALL">("ALL")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const repository = useRef(new UserMediaRepository())

  const loadMedia = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const items = await repository.current.getAllUserMediaItems()
      setMediaItems(items)
    } catch (e) {
      setError(`Failed to load media: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // For now, we'll need to ask user for type and threat classification
    // In a full implementation, you'd have a dialog for this
    const file = files[0]
    const isVideo = file.type.startsWith("video/")
    const mediaType = isVideo ? MediaType.VIDEO : MediaType.PHOTO

    // Default to THREAT for now - in production, show a dialog
    const threatType = ThreatType.THREAT

    try {
      await repository.current.saveUserMedia(file, mediaType, threatType)
      await loadMedia()
    } catch (e) {
      setError(`Failed to import media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (mediaItem: MediaItem) => {
    if (!confirm("Are you sure you want to delete this media?")) return

    try {
      await repository.current.deleteUserMedia(mediaItem)
      await loadMedia()
    } catch (e) {
      setError(`Failed to delete media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const filteredMedia = mediaItems.filter((item) => {
    if (selectedMediaType !== "ALL" && item.type !== selectedMediaType) return false
    if (selectedThreatType !== "ALL" && item.threatType !== selectedThreatType) return false
    return true
  })

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Management</CardTitle>
              <CardDescription>
                Manage your custom training media files
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/session-config")} variant="outline">
              Back to Config
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Media Type:</label>
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value as MediaType | "ALL")}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="ALL">All</option>
                <option value={MediaType.VIDEO}>Videos</option>
                <option value={MediaType.PHOTO}>Photos</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Threat Type:</label>
              <select
                value={selectedThreatType}
                onChange={(e) => setSelectedThreatType(e.target.value as ThreatType | "ALL")}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="ALL">All</option>
                <option value={ThreatType.THREAT}>Threat</option>
                <option value={ThreatType.NON_THREAT}>Non-Threat</option>
              </select>
            </div>
          </div>

          {/* Import Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Import Media
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Supported: Videos (MP4, WebM) and Images (JPG, PNG, WebP)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Media Grid */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No media files found. Import some media to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredMedia.map((item) => (
                <MediaItemCard
                  key={item.path}
                  mediaItem={item}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MediaItemCard({
  mediaItem,
  onDelete,
}: {
  mediaItem: MediaItem
  onDelete: () => void
}) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (mediaItem.path.startsWith("indexeddb://")) {
      IndexedDBService.getMediaFile(mediaItem.path)
        .then((file) => {
          if (file) {
            setMediaUrl(URL.createObjectURL(file))
          }
        })
        .catch((e) => {
          console.error("Failed to load media:", e)
        })
    }
  }, [mediaItem.path])

  return (
    <Card>
      <CardContent className="p-0">
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
        </div>
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <div className="font-medium">{mediaItem.type}</div>
              <div className="text-muted-foreground">{mediaItem.threatType}</div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

