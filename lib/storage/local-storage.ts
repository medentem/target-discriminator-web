import { SessionStats } from "@/lib/models/session-stats"

const PREFS_NAME = "target_discriminator"
const KEY_STATS = "session_stats"
const KEY_AGE_VERIFIED = "age_verified"

export class LocalStorageService {
  private static getStorage(): Storage | null {
    if (typeof window === "undefined") return null
    return window.localStorage
  }

  static saveSessionStats(stats: SessionStats): void {
    const storage = this.getStorage()
    if (!storage) return

    const allStats = this.getAllSessionStats()
    const newId = allStats.length === 0 
      ? 1 
      : Math.max(...allStats.map(s => s.id)) + 1
    
    const statsWithId = { ...stats, id: newId }
    allStats.push(statsWithId)
    
    try {
      storage.setItem(KEY_STATS, JSON.stringify(allStats))
    } catch (e) {
      console.error("Failed to save session stats:", e)
    }
  }

  static getAllSessionStats(): SessionStats[] {
    const storage = this.getStorage()
    if (!storage) return []

    try {
      const jsonString = storage.getItem(KEY_STATS)
      if (!jsonString) return []
      
      const stats = JSON.parse(jsonString) as SessionStats[]
      return stats.sort((a, b) => b.timestamp - a.timestamp)
    } catch (e) {
      console.error("Failed to load session stats:", e)
      return []
    }
  }

  static getRecentSessionStats(limit: number = 10): SessionStats[] {
    return this.getAllSessionStats().slice(0, limit)
  }

  static setAgeVerified(verified: boolean): void {
    const storage = this.getStorage()
    if (!storage) return

    try {
      storage.setItem(KEY_AGE_VERIFIED, JSON.stringify(verified))
    } catch (e) {
      console.error("Failed to save age verification status:", e)
    }
  }

  static isAgeVerified(): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      const jsonString = storage.getItem(KEY_AGE_VERIFIED)
      if (!jsonString) return false
      
      return JSON.parse(jsonString) === true
    } catch (e) {
      console.error("Failed to load age verification status:", e)
      return false
    }
  }
}

