import apiClient from './client'

export interface AnnotationDemo {
  id: number
  chapter_id: number
  demo_type: string
  selected_text: string
  content: string
  explanation?: string
}

export const getChapterDemos = (chapterId: number) =>
  apiClient.get<AnnotationDemo[]>(`/annotation-demos/chapter/${chapterId}`)
