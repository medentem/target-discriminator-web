import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { IndexedDBService } from "@/lib/storage/indexed-db"
import { BUILT_IN_MEDIA } from "@/lib/data/media-manifest-generated"

export class MediaRepository {
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
      const file = await IndexedDBService.getMediaFile(mediaItem.path)
      if (file) {
        return URL.createObjectURL(file)
      }
      throw new Error("Failed to load user media file")
    }

    // Built-in media from public folder - ensure it starts with /
    if (!mediaItem.path.startsWith("/")) {
      return `/${mediaItem.path}`
    }
    return mediaItem.path
  }
}

