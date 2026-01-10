"use client"

import { Button } from "@/components/ui/button"

interface MediaGalleryToolbarProps {
  selectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onExcludeSelected: () => void
  onIncludeSelected: () => void
  onReclassifySelected: () => void
  onClearOverrides: () => void
}

export function MediaGalleryToolbar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onExcludeSelected,
  onIncludeSelected,
  onReclassifySelected,
  onClearOverrides,
}: MediaGalleryToolbarProps) {
  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          Select All
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Button variant="outline" size="sm" onClick={onDeselectAll}>
        Deselect All
      </Button>
      <Button variant="destructive" size="sm" onClick={onExcludeSelected}>
        Exclude Selected ({selectedCount})
      </Button>
      <Button variant="default" size="sm" onClick={onIncludeSelected}>
        Include Selected ({selectedCount})
      </Button>
      <Button variant="secondary" size="sm" onClick={onReclassifySelected}>
        Reclassify Selected ({selectedCount})
      </Button>
      <Button variant="outline" size="sm" onClick={onClearOverrides}>
        Clear Overrides ({selectedCount})
      </Button>
    </div>
  )
}
