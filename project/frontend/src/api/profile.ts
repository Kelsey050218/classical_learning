import apiClient from './client'

export interface LiteracyDimension {
  key: string
  framework_code: string
  label: string
  score: number | null
  self_score: number | null
  behavior_score: number | null
  highlights: string[]
}

export interface LiteracyRadarPayload {
  level_text: string | null
  overall_score: number | null
  dimensions: LiteracyDimension[]
  summary_text: string | null
  generated_at: string
}

export const getLiteracyRadar = () =>
  apiClient.get<LiteracyRadarPayload>('/profile/literacy-radar')
