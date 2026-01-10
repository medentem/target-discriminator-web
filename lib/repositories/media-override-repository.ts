import { MediaOverride } from "@/lib/models/media-override"
import { ThreatType } from "@/lib/models/types"
import { IndexedDBService } from "@/lib/storage/indexed-db"

export class MediaOverrideRepository {
  async getOverride(mediaPath: string): Promise<MediaOverride | null> {
    return IndexedDBService.getMediaOverride(mediaPath)
  }

  async getAllOverrides(): Promise<MediaOverride[]> {
    return IndexedDBService.getAllMediaOverrides()
  }

  async getOverridesMap(): Promise<Map<string, MediaOverride>> {
    return IndexedDBService.getMediaOverridesMap()
  }

  async setExcluded(mediaPath: string, excluded: boolean): Promise<void> {
    const existing = await this.getOverride(mediaPath)
    const now = Date.now()

    const override: MediaOverride = {
      mediaPath,
      isExcluded: excluded,
      threatTypeOverride: existing?.threatTypeOverride,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    // If no exclusions and no overrides, delete the override entry
    if (!excluded && !override.threatTypeOverride) {
      await IndexedDBService.deleteMediaOverride(mediaPath)
    } else {
      await IndexedDBService.saveMediaOverride(override)
    }
  }

  async setThreatTypeOverride(
    mediaPath: string,
    threatType: ThreatType | null
  ): Promise<void> {
    const existing = await this.getOverride(mediaPath)
    const now = Date.now()

    const override: MediaOverride = {
      mediaPath,
      isExcluded: existing?.isExcluded || false,
      threatTypeOverride: threatType || undefined,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    // If no exclusions and no overrides, delete the override entry
    if (!override.isExcluded && !threatType) {
      await IndexedDBService.deleteMediaOverride(mediaPath)
    } else {
      await IndexedDBService.saveMediaOverride(override)
    }
  }

  async clearOverride(mediaPath: string): Promise<void> {
    await IndexedDBService.deleteMediaOverride(mediaPath)
  }

  async getExcludedPaths(): Promise<Set<string>> {
    return IndexedDBService.getExcludedMediaPaths()
  }
}
