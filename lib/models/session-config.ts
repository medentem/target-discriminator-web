export interface SessionConfig {
  includeVideos: boolean
  includePhotos: boolean
  durationMinutes: number
}

export function isValidSessionConfig(config: SessionConfig): boolean {
  return (config.includeVideos || config.includePhotos) && config.durationMinutes > 0
}

