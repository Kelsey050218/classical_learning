import apiClient from './client'

export interface HighlightItem {
  id: number
  chapter_id: number
  position_start: number
  position_end: number
  color: string
  quote_text: string
  created_at: string
}

export const createHighlight = (data: {
  chapter_id: number
  position_start: number
  position_end: number
  color?: string
  quote_text: string
}) => apiClient.post<{ id: number; message: string }>('/highlights', null, { params: data })

export const getHighlights = (chapterId?: number) =>
  apiClient.get<HighlightItem[]>('/highlights', {
    params: chapterId ? { chapter_id: chapterId } : undefined,
  })

export const deleteHighlight = (id: number) =>
  apiClient.delete(`/highlights/${id}`)
