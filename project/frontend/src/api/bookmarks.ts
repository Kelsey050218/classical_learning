import apiClient from './client'

export interface BookmarkItem {
  id: number
  chapter_id: number
  position_start: number
  position_end: number
  note: string | null
  created_at: string
}

export const createBookmark = (data: {
  chapter_id: number
  position_start: number
  position_end: number
  note?: string
}) => apiClient.post<{ id: number; message: string }>('/bookmarks', null, { params: data })

export const getBookmarks = (chapterId?: number) =>
  apiClient.get<BookmarkItem[]>('/bookmarks', {
    params: chapterId ? { chapter_id: chapterId } : undefined,
  })

export const deleteBookmark = (id: number) =>
  apiClient.delete(`/bookmarks/${id}`)
