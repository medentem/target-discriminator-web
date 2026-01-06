import { ThreatType, UserResponse } from "./types"

export interface ResponseResult {
  isCorrect: boolean
  userResponse: UserResponse
  actualThreatType: ThreatType
  reactionTimeMs: number | null
}

