import { SessionStats } from "@/lib/models/session-stats"
import { LocalStorageService } from "@/lib/storage/local-storage"

export class SessionStatsRepository {
  async saveSessionStats(stats: SessionStats): Promise<void> {
    LocalStorageService.saveSessionStats(stats)
  }

  async getAllSessionStats(): Promise<SessionStats[]> {
    return LocalStorageService.getAllSessionStats()
  }

  async getRecentSessionStats(limit: number = 10): Promise<SessionStats[]> {
    return LocalStorageService.getRecentSessionStats(limit)
  }
}

