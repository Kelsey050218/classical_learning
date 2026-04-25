import apiClient from './client'

export interface Badge {
  type: string
  name: string
  description: string
  icon: string
  is_unlocked: boolean
  awarded_at?: string
  reason?: string
}

export const getAllBadges = () =>
  apiClient.get<Badge[]>('/badges')

export const getMyBadges = () =>
  apiClient.get<Badge[]>('/badges/my')
