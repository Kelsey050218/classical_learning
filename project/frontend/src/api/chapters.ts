import apiClient from './client'

export interface Chapter {
  id: number
  title: string
  sort_order: number
  is_completed?: boolean
}

export interface ChapterDetail {
  id: number
  title: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}

export const listChapters = (includeContent = false) =>
  apiClient.get<Chapter[]>('/chapters/', {
    params: includeContent ? { include_content: true } : undefined,
  })

export const getChapter = (id: number) =>
  apiClient.get<ChapterDetail>(`/chapters/${id}`)
