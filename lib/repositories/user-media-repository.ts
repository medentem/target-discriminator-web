import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { IndexedDBService } from "@/lib/storage/indexed-db"

export class UserMediaRepository {
  async getUserMediaItems(
    mediaType: MediaType,
    threatType: ThreatType
  ): Promise<MediaItem[]> {
    return IndexedDBService.getUserMediaItems(mediaType, threatType)
  }

  async getAllUserMediaItems(): Promise<MediaItem[]> {
    return IndexedDBService.getAllUserMediaItems()
  }

  async saveUserMedia(
    file: File,
    mediaType: MediaType,
    threatType: ThreatType
  ): Promise<MediaItem> {
    return IndexedDBService.saveUserMedia(file, mediaType, threatType)
  }

  async deleteUserMedia(mediaItem: MediaItem): Promise<void> {
    return IndexedDBService.deleteUserMedia(mediaItem)
  }
}

