import apiClient from './client'

export interface ReadingProgressResponse {
  id: number
  user_id: number
  chapter_id: number
  current_position: number
  is_completed: boolean
  last_read_at: string
}

export interface AnnotationResponse {
  id: number
  user_id: number
  chapter_id: number
  position_start: number
  position_end: number
  content: string
  annotation_type: string
  created_at: string
}

export const getReadingProgressList = () =>
  apiClient.get<ReadingProgressResponse[]>('/reading/progress/')

export const updateReadingProgress = (chapterId: number, data: {
  current_position: number
  is_completed: boolean
}) =>
  apiClient.put<ReadingProgressResponse>(`/reading/progress/${chapterId}`, data)

export const createAnnotation = (chapterId: number, data: {
  position_start: number
  position_end: number
  content: string
  annotation_type: string
}) =>
  apiClient.post<AnnotationResponse>(`/reading/annotations/${chapterId}`, data)

export const getChapterAnnotations = (chapterId: number) =>
  apiClient.get<{ annotations: AnnotationResponse[]; total: number }>(`/reading/annotations/${chapterId}`)
