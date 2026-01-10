"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { MediaOverride } from "@/lib/models/media-override"
import { MediaRepository } from "@/lib/repositories/media-repository"
import { MediaOverrideRepository } from "@/lib/repositories/media-override-repository"
import { MediaItemCard } from "@/components/media-gallery/media-item-card"
import { MediaGalleryFilters, FilterState } from "@/components/media-gallery/media-gallery-filters"
import { MediaGalleryToolbar } from "@/components/media-gallery/media-gallery-toolbar"
import { AgeVerificationGuard } from "@/components/age-verification-guard"
import { cn } from "@/lib/utils"

function MediaGalleryPageContent() {
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [overrides, setOverrides] = useState<Map<string, MediaOverride>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>({
    mediaType: "ALL",
    threatType: "ALL",
    status: "ALL",
    source: "ALL",
  })
  const [showReclassifyDialog, setShowReclassifyDialog] = useState(false)
  const [reclassifyThreatType, setReclassifyThreatType] = useState<ThreatType>(ThreatType.THREAT)
  const [pendingReclassifyPaths, setPendingReclassifyPaths] = useState<Set<string>>(new Set())

  const mediaRepository = useRef(new MediaRepository())
  const overrideRepository = useRef(new MediaOverrideRepository())

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [items, overrideList] = await Promise.all([
        mediaRepository.current.getAllMediaItemsForGallery(),
        overrideRepository.current.getAllOverrides(),
      ])
      setMediaItems(items)
      setOverrides(new Map(overrideList.map((o) => [o.mediaPath, o])))
    } catch (e) {
      setError(`Failed to load media: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredMedia = mediaItems.filter((item) => {
    // Media type filter
    if (filters.mediaType !== "ALL" && item.type !== filters.mediaType) return false

    // Threat type filter (use display threat type)
    const override = overrides.get(item.path)
    const displayThreatType = override?.threatTypeOverride || item.threatType
    if (filters.threatType !== "ALL" && displayThreatType !== filters.threatType) return false

    // Status filter
    const isExcluded = override?.isExcluded || false
    if (filters.status === "EXCLUDED" && !isExcluded) return false
    if (filters.status === "INCLUDED" && isExcluded) return false

    // Source filter
    const isBuiltIn = !item.path.startsWith("indexeddb://")
    if (filters.source === "BUILT_IN" && !isBuiltIn) return false
    if (filters.source === "USER" && isBuiltIn) return false

    return true
  })

  const handleExclude = async (path: string) => {
    try {
      await overrideRepository.current.setExcluded(path, true)
      await loadData()
    } catch (e) {
      setError(`Failed to exclude media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleInclude = async (path: string) => {
    try {
      await overrideRepository.current.setExcluded(path, false)
      await loadData()
    } catch (e) {
      setError(`Failed to include media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleReclassify = async (path: string, threatType: ThreatType) => {
    try {
      await overrideRepository.current.setThreatTypeOverride(path, threatType)
      await loadData()
    } catch (e) {
      setError(`Failed to reclassify media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleBulkExclude = async () => {
    try {
      await Promise.all(
        Array.from(selectedPaths).map((path) =>
          overrideRepository.current.setExcluded(path, true)
        )
      )
      setSelectedPaths(new Set())
      await loadData()
    } catch (e) {
      setError(`Failed to exclude media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleBulkInclude = async () => {
    try {
      await Promise.all(
        Array.from(selectedPaths).map((path) =>
          overrideRepository.current.setExcluded(path, false)
        )
      )
      setSelectedPaths(new Set())
      await loadData()
    } catch (e) {
      setError(`Failed to include media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleBulkReclassify = () => {
    if (selectedPaths.size === 0) return
    setReclassifyThreatType(ThreatType.THREAT) // Default for bulk
    setPendingReclassifyPaths(new Set(selectedPaths))
    setShowReclassifyDialog(true)
  }

  const handleConfirmBulkReclassify = async () => {
    try {
      await Promise.all(
        Array.from(pendingReclassifyPaths).map((path) =>
          overrideRepository.current.setThreatTypeOverride(path, reclassifyThreatType)
        )
      )
      setSelectedPaths(new Set())
      setPendingReclassifyPaths(new Set())
      setShowReclassifyDialog(false)
      await loadData()
    } catch (e) {
      setError(`Failed to reclassify media: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleClearOverrides = async () => {
    try {
      await Promise.all(
        Array.from(selectedPaths).map((path) =>
          overrideRepository.current.clearOverride(path)
        )
      )
      setSelectedPaths(new Set())
      await loadData()
    } catch (e) {
      setError(`Failed to clear overrides: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
  }

  const handleSelectAll = () => {
    setSelectedPaths(new Set(filteredMedia.map((item) => item.path)))
  }

  const handleDeselectAll = () => {
    setSelectedPaths(new Set())
  }

  const handleToggleSelect = (path: string, selected: boolean) => {
    const newSelected = new Set(selectedPaths)
    if (selected) {
      newSelected.add(path)
    } else {
      newSelected.delete(path)
    }
    setSelectedPaths(newSelected)
  }

  const handleSingleReclassify = (path: string) => {
    const override = overrides.get(path)
    const currentThreatType = override?.threatTypeOverride || mediaItems.find(m => m.path === path)?.threatType || ThreatType.THREAT
    // Set to opposite of current for convenience
    setReclassifyThreatType(currentThreatType === ThreatType.THREAT ? ThreatType.NON_THREAT : ThreatType.THREAT)
    setPendingReclassifyPaths(new Set([path]))
    setShowReclassifyDialog(true)
  }

  const handleConfirmSingleReclassify = async () => {
    if (pendingReclassifyPaths.size === 0) return
    const path = Array.from(pendingReclassifyPaths)[0]
    await handleReclassify(path, reclassifyThreatType)
    setPendingReclassifyPaths(new Set())
    setShowReclassifyDialog(false)
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>
                View and manage all training media. Exclude items or reclassify them.
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/session-config")} variant="outline">
              Back to Config
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <MediaGalleryFilters filters={filters} onFilterChange={setFilters} />

          {/* Toolbar */}
          <MediaGalleryToolbar
            selectedCount={selectedPaths.size}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onExcludeSelected={handleBulkExclude}
            onIncludeSelected={handleBulkInclude}
            onReclassifySelected={handleBulkReclassify}
            onClearOverrides={handleClearOverrides}
          />

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Reclassify Dialog */}
          <Dialog open={showReclassifyDialog} onOpenChange={setShowReclassifyDialog}>
            <DialogContent
              title="Reclassify Media"
              description={
                pendingReclassifyPaths.size === 1
                  ? "Select the new threat classification for this media item."
                  : `Select the new threat classification for ${pendingReclassifyPaths.size} selected items.`
              }
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Threat Classification:</label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                      <input
                        type="radio"
                        name="threatType"
                        value={ThreatType.THREAT}
                        checked={reclassifyThreatType === ThreatType.THREAT}
                        onChange={(e) =>
                          setReclassifyThreatType(e.target.value as ThreatType)
                        }
                        className="h-4 w-4"
                      />
                      <span className="font-medium text-destructive">Threat</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent">
                      <input
                        type="radio"
                        name="threatType"
                        value={ThreatType.NON_THREAT}
                        checked={reclassifyThreatType === ThreatType.NON_THREAT}
                        onChange={(e) =>
                          setReclassifyThreatType(e.target.value as ThreatType)
                        }
                        className="h-4 w-4"
                      />
                      <span className="font-medium text-green-600">Non-Threat</span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReclassifyDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={
                    pendingReclassifyPaths.size === 1
                      ? handleConfirmSingleReclassify
                      : handleConfirmBulkReclassify
                  }
                >
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Media Grid */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No media found matching the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredMedia.map((item) => (
                <MediaItemCard
                  key={item.path}
                  mediaItem={item}
                  override={overrides.get(item.path)}
                  isSelected={selectedPaths.has(item.path)}
                  onSelect={(selected) => handleToggleSelect(item.path, selected)}
                  onExclude={() => handleExclude(item.path)}
                  onInclude={() => handleInclude(item.path)}
                  onReclassify={() => handleSingleReclassify(item.path)}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {!isLoading && (
            <div className="pt-4 text-sm text-muted-foreground">
              Showing {filteredMedia.length} of {mediaItems.length} media items
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function MediaGalleryPage() {
  return (
    <AgeVerificationGuard>
      <MediaGalleryPageContent />
    </AgeVerificationGuard>
  )
}
