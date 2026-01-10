export enum ThreatType {
  THREAT = "THREAT",
  NON_THREAT = "NON_THREAT",
}

export enum MediaType {
  VIDEO = "VIDEO",
  PHOTO = "PHOTO",
}

export enum UserResponse {
  TAP = "TAP",
  SWIPE = "SWIPE",
}

export type ThreatLabelPreset = "THREAT_NON_THREAT" | "SHOOT_NO_SHOOT" | "CUSTOM"

export interface ThreatLabelConfig {
  preset: ThreatLabelPreset
  customThreatLabel?: string
  customNonThreatLabel?: string
}

