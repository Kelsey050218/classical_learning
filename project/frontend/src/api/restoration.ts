import apiClient from './client'

export interface RestorationChapter {
  id: number
  chapter_id: number
  name: string
  alias: string
  description: string
  difficulty: string
  sort_order: number
  image_url?: string
  positioning: string
}

export interface Fragment {
  id: number
  content: string
  category: string
}

export interface Diagnostic {
  id: number
  question_type: string
  content: string
  options?: string[]
  sort_order: number
  hint?: string
}

export interface Node {
  id: number
  content: string
  sort_order: number
}

export interface Progress {
  chapter_id: number
  current_step: string
  diagnostic_correct: number
  sorting_correct: number
  sorting_completed: boolean
  sequencing_attempts: number
  sequencing_completed: boolean
  archive_completed: boolean
}

export interface ArchiveData {
  chapter: RestorationChapter
  archive_summary: string
  archive_impact: string
  note?: string
}

export interface DiagnosticResult {
  correct_count: number
  total: number
}

export interface FragmentResult {
  correct_count: number
  total: number
}

export interface NodeResult {
  is_correct: boolean
  wrong_positions: number[]
}

export const listChapters = () =>
  apiClient.get<RestorationChapter[]>('/restoration/chapters')

export const getChapter = (id: number) =>
  apiClient.get<RestorationChapter>(`/restoration/chapters/${id}`)

export const getDiagnostics = (chapterId: number) =>
  apiClient.get<Diagnostic[]>(`/restoration/chapters/${chapterId}/diagnostic`)

export const submitDiagnostic = (chapterId: number, answers: Record<number, string>) =>
  apiClient.post<DiagnosticResult>(`/restoration/chapters/${chapterId}/diagnostic/submit`, { answers })

export const getFragments = (chapterId: number) =>
  apiClient.get<Fragment[]>(`/restoration/chapters/${chapterId}/fragments`)

export const submitFragments = (chapterId: number, placements: Record<number, string>) =>
  apiClient.post<FragmentResult>(`/restoration/chapters/${chapterId}/fragments/submit`, { placements })

export const getNodes = (chapterId: number) =>
  apiClient.get<Node[]>(`/restoration/chapters/${chapterId}/nodes`)

export const submitNodes = (chapterId: number, order: number[]) =>
  apiClient.post<NodeResult>(`/restoration/chapters/${chapterId}/nodes/submit`, { order })

export const getArchive = (chapterId: number) =>
  apiClient.get<ArchiveData>(`/restoration/chapters/${chapterId}/archive`)

export const saveNote = (chapterId: number, note: string) =>
  apiClient.post(`/restoration/chapters/${chapterId}/archive/note`, { note })

export const getProgress = () =>
  apiClient.get<Progress[]>('/restoration/progress')

export const getNote = (chapterId: number) =>
  apiClient.get<{ chapter_id: number; note: string }>(`/restoration/notes/${chapterId}`)
