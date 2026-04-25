import apiClient from './client'

export interface GoldenQuoteItem {
  id: number
  chapter_id: number | null
  position_start: number | null
  position_end: number | null
  quote_text: string
  source_chapter: string | null
  tags: string[]
  note: string | null
  created_at: string
}

export const createGoldenQuote = (data: {
  quote_text: string
  chapter_id?: number
  position_start?: number
  position_end?: number
  source_chapter?: string
  tags?: string[]
  note?: string
}) => apiClient.post<{ id: number; message: string }>('/golden-quotes', data)

export const getGoldenQuotes = (chapterId?: number) =>
  apiClient.get<GoldenQuoteItem[]>('/golden-quotes', {
    params: chapterId ? { chapter_id: chapterId } : undefined,
  })

export const deleteGoldenQuote = (id: number) => apiClient.delete(`/golden-quotes/${id}`)
