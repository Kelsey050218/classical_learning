import apiClient from './client'

export interface NoteItem {
  id: number
  chapter_id: number | null
  title: string
  content: string
  images: string[]
  category: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export const createNote = (data: {
  title: string
  content: string
  chapter_id?: number
  images?: string[]
  category?: string
  tags?: string[]
}) => apiClient.post<{ id: number; message: string }>('/notes', data)

export const getNotes = (params?: {
  chapter_id?: number
  category?: string
  search?: string
}) => apiClient.get<NoteItem[]>('/notes', { params })

export const updateNote = (
  id: number,
  data: {
    title?: string
    content?: string
    images?: string[]
    category?: string
    tags?: string[]
  }
) => apiClient.put<{ id: number; message: string }>(`/notes/${id}`, data)

export const deleteNote = (id: number) => apiClient.delete(`/notes/${id}`)
