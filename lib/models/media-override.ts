import { ThreatType } from "./types"

export interface MediaOverride {
  mediaPath: string // Unique identifier for the media item
  isExcluded: boolean
  threatTypeOverride?: ThreatType // If set, overrides original classification
  createdAt: number
  updatedAt: number
}
