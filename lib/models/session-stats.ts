export interface SessionStats {
  id: number
  timestamp: number
  totalResponses: number
  correctResponses: number
  averageReactionTimeMs: number | null
}

export function calculateScore(stats: SessionStats): number {
  if (stats.totalResponses === 0) return 0
  return stats.correctResponses / stats.totalResponses
}

export function formatDate(timestamp: number): Date {
  return new Date(timestamp)
}

