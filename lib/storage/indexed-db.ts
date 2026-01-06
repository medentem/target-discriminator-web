import { MediaItem } from "@/lib/models/media-item"
import { MediaType, ThreatType } from "@/lib/models/types"

const DB_NAME = "target_discriminator_db"
const DB_VERSION = 1
const STORE_NAME = "user_media"

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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" })
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
}

