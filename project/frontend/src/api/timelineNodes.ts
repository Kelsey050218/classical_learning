import apiClient from './client'

export interface TimelineNode {
  id: number
  era: string
  period: string
  title: string
  content: string
  key_points: string[]
  sort_order: number
  image_url?: string
  created_at: string
  updated_at: string
}

export const listTimelineNodes = () =>
  apiClient.get('/timeline/nodes')

export const getTimelineNode = (id: number) =>
  apiClient.get(`/timeline/nodes/${id}`)
