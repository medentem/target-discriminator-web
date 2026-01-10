"use client"

import { MediaType, ThreatType } from "@/lib/models/types"
import { useThreatLabels } from "@/lib/hooks/use-threat-labels"
import { Button } from "@/components/ui/button"

export interface FilterState {
  mediaType: MediaType | "ALL"
  threatType: ThreatType | "ALL"
  status: "ALL" | "INCLUDED" | "EXCLUDED"
  source: "ALL" | "BUILT_IN" | "USER"
}

interface MediaGalleryFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function MediaGalleryFilters({
  filters,
  onFilterChange,
}: MediaGalleryFiltersProps) {
  const labels = useThreatLabels()
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Media Type:</label>
        <select
          value={filters.mediaType}
          onChange={(e) =>
            updateFilter("mediaType", e.target.value as MediaType | "ALL")
          }
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
          value={filters.threatType}
          onChange={(e) =>
            updateFilter("threatType", e.target.value as ThreatType | "ALL")
          }
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="ALL">All</option>
          <option value={ThreatType.THREAT}>{labels.threat}</option>
          <option value={ThreatType.NON_THREAT}>{labels.nonThreat}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <select
          value={filters.status}
          onChange={(e) =>
            updateFilter("status", e.target.value as "ALL" | "INCLUDED" | "EXCLUDED")
          }
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="ALL">All</option>
          <option value="INCLUDED">Included</option>
          <option value="EXCLUDED">Excluded</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Source:</label>
        <select
          value={filters.source}
          onChange={(e) =>
            updateFilter("source", e.target.value as "ALL" | "BUILT_IN" | "USER")
          }
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="ALL">All</option>
          <option value="BUILT_IN">Built-in</option>
          <option value="USER">User</option>
        </select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onFilterChange({
            mediaType: "ALL",
            threatType: "ALL",
            status: "ALL",
            source: "ALL",
          })
        }
      >
        Clear Filters
      </Button>
    </div>
  )
}
