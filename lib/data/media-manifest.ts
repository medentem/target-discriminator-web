import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"

// This will be populated at build time or runtime
// For now, we'll generate it dynamically from the public folder
export async function getBuiltInMediaItems(): Promise<MediaItem[]> {
  // In a production app, you might want to generate this at build time
  // For now, we'll return an empty array and let the MediaRepository
  // handle loading from the public folder dynamically
  return []
}

// Helper to get media path
export function getMediaPath(
  type: MediaType,
  threatType: ThreatType,
  filename: string
): string {
  const typeFolder = type === MediaType.VIDEO ? "videos" : "photos"
  const threatFolder = threatType === ThreatType.THREAT ? "threat" : "non_threat"
  return `/media/${typeFolder}/${threatFolder}/${filename}`
}

