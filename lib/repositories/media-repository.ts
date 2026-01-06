import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { IndexedDBService } from "@/lib/storage/indexed-db"
import { BUILT_IN_MEDIA } from "@/lib/data/media-manifest-generated"

export class MediaRepository {
  // Cache object URLs to prevent creating duplicates and causing flickering
  private objectUrlCache = new Map<string, string>()

  async getMediaItems(
    includeVideos: boolean,
    includePhotos: boolean,
    includeUserMedia: boolean = true
  ): Promise<MediaItem[]> {
    const mediaItems: MediaItem[] = []

    // Add built-in media
    if (includeVideos) {
      mediaItems.push(
        ...BUILT_IN_MEDIA.filter(
          (m) => m.type === MediaType.VIDEO && m.threatType === ThreatType.THREAT
        )
      )
      mediaItems.push(
        ...BUILT_IN_MEDIA.filter(
          (m) =>
            m.type === MediaType.VIDEO && m.threatType === ThreatType.NON_THREAT
        )
      )
    }

    if (includePhotos) {
      mediaItems.push(
        ...BUILT_IN_MEDIA.filter(
          (m) => m.type === MediaType.PHOTO && m.threatType === ThreatType.THREAT
        )
      )
      mediaItems.push(
        ...BUILT_IN_MEDIA.filter(
          (m) =>
            m.type === MediaType.PHOTO && m.threatType === ThreatType.NON_THREAT
        )
      )
    }

    // Add user media
    if (includeUserMedia) {
      if (includeVideos) {
        const userVideosThreat = await IndexedDBService.getUserMediaItems(
          MediaType.VIDEO,
          ThreatType.THREAT
        )
        const userVideosNonThreat = await IndexedDBService.getUserMediaItems(
          MediaType.VIDEO,
          ThreatType.NON_THREAT
        )
        mediaItems.push(...userVideosThreat, ...userVideosNonThreat)
      }

      if (includePhotos) {
        const userPhotosThreat = await IndexedDBService.getUserMediaItems(
          MediaType.PHOTO,
          ThreatType.THREAT
        )
        const userPhotosNonThreat = await IndexedDBService.getUserMediaItems(
          MediaType.PHOTO,
          ThreatType.NON_THREAT
        )
        mediaItems.push(...userPhotosThreat, ...userPhotosNonThreat)
      }
    }

    return mediaItems
  }

  async getMediaUrl(mediaItem: MediaItem): Promise<string> {
    if (mediaItem.path.startsWith("indexeddb://")) {
      // Check cache first to avoid creating duplicate object URLs
      if (this.objectUrlCache.has(mediaItem.path)) {
        return this.objectUrlCache.get(mediaItem.path)!
      }

      const file = await IndexedDBService.getMediaFile(mediaItem.path)
      if (file) {
        const objectUrl = URL.createObjectURL(file)
        this.objectUrlCache.set(mediaItem.path, objectUrl)
        return objectUrl
      }
      throw new Error("Failed to load user media file")
    }

    // Built-in media from public folder - ensure it starts with /
    if (!mediaItem.path.startsWith("/")) {
      return `/${mediaItem.path}`
    }
    return mediaItem.path
  }

  // Clean up object URLs for a specific media item
  revokeMediaUrl(mediaItem: MediaItem): void {
    if (mediaItem.path.startsWith("indexeddb://")) {
      const cachedUrl = this.objectUrlCache.get(mediaItem.path)
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl)
        this.objectUrlCache.delete(mediaItem.path)
      }
    }
  }

  // Clean up all cached object URLs
  revokeAllMediaUrls(): void {
    for (const url of this.objectUrlCache.values()) {
      URL.revokeObjectURL(url)
    }
    this.objectUrlCache.clear()
  }
}

