import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"
import { MediaOverride } from "@/lib/models/media-override"

const DB_NAME = "target_discriminator_db"
const DB_VERSION = 2
const STORE_NAME = "user_media"
const OVERRIDE_STORE_NAME = "media_overrides"

interface StoredMedia {
  id: string
  file: File
  mediaType: MediaType
  threatType: ThreatType
  timestamp: number
}

export class IndexedDBService {
  private static db: IDBDatabase | null = null

  private static async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const oldVersion = event.oldVersion || 0
        
        // Create user_media store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" })
        }
        
        // Create media_overrides store for version 2+
        if (oldVersion < 2 && !db.objectStoreNames.contains(OVERRIDE_STORE_NAME)) {
          db.createObjectStore(OVERRIDE_STORE_NAME, { keyPath: "mediaPath" })
        }
      }
    })
  }

  static async saveUserMedia(
    file: File,
    mediaType: MediaType,
    threatType: ThreatType
  ): Promise<MediaItem> {
    const db = await this.openDB()
    const id = crypto.randomUUID()
    const stored: StoredMedia = {
      id,
      file,
      mediaType,
      threatType,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(stored)

      request.onsuccess = () => {
        const path = `indexeddb://${id}`
        resolve({
          path,
          type: mediaType,
          threatType,
        })
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async getUserMediaItems(
    mediaType: MediaType,
    threatType: ThreatType
  ): Promise<MediaItem[]> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const items = (request.result as StoredMedia[])
          .filter(
            (item) =>
              item.mediaType === mediaType && item.threatType === threatType
          )
          .map((item) => ({
            path: `indexeddb://${item.id}`,
            type: item.mediaType,
            threatType: item.threatType,
          }))
        resolve(items)
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async getAllUserMediaItems(): Promise<MediaItem[]> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const items = (request.result as StoredMedia[]).map((item) => ({
          path: `indexeddb://${item.id}`,
          type: item.mediaType,
          threatType: item.threatType,
        }))
        resolve(items)
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async getMediaFile(path: string): Promise<File | null> {
    if (!path.startsWith("indexeddb://")) return null

    const id = path.replace("indexeddb://", "")
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        const stored = request.result as StoredMedia | undefined
        resolve(stored?.file || null)
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async deleteUserMedia(mediaItem: MediaItem): Promise<void> {
    if (!mediaItem.path.startsWith("indexeddb://")) {
      throw new Error("Invalid media path")
    }

    const id = mediaItem.path.replace("indexeddb://", "")
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Media Override methods
  static async getMediaOverride(mediaPath: string): Promise<MediaOverride | null> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OVERRIDE_STORE_NAME], "readonly")
      const store = transaction.objectStore(OVERRIDE_STORE_NAME)
      const request = store.get(mediaPath)

      request.onsuccess = () => {
        resolve((request.result as MediaOverride) || null)
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async getAllMediaOverrides(): Promise<MediaOverride[]> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OVERRIDE_STORE_NAME], "readonly")
      const store = transaction.objectStore(OVERRIDE_STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve((request.result as MediaOverride[]) || [])
      }

      request.onerror = () => reject(request.error)
    })
  }

  static async saveMediaOverride(override: MediaOverride): Promise<void> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OVERRIDE_STORE_NAME], "readwrite")
      const store = transaction.objectStore(OVERRIDE_STORE_NAME)
      const request = store.put(override)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  static async deleteMediaOverride(mediaPath: string): Promise<void> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OVERRIDE_STORE_NAME], "readwrite")
      const store = transaction.objectStore(OVERRIDE_STORE_NAME)
      const request = store.delete(mediaPath)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  static async getExcludedMediaPaths(): Promise<Set<string>> {
    const overrides = await this.getAllMediaOverrides()
    return new Set(
      overrides.filter((o) => o.isExcluded).map((o) => o.mediaPath)
    )
  }

  static async getMediaOverridesMap(): Promise<Map<string, MediaOverride>> {
    const overrides = await this.getAllMediaOverrides()
    return new Map(overrides.map((o) => [o.mediaPath, o]))
  }
}

