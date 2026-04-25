import apiClient from './client'

export interface WorkCreate {
  work_type: 'video' | 'audio' | 'script'
  title: string
  description?: string
  content?: string
  file_url?: string
  chapter_id?: number
}

export interface WorkUpdate {
  title?: string
  description?: string
  content?: string
  chapter_id?: number
  status?: 'draft' | 'published'
}

export interface Work {
  id: number
  user_id: number
  work_type: 'video' | 'audio' | 'script'
  title: string
  description?: string
  file_url?: string
  cover_url?: string
  content?: string
  chapter_id?: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export const listWorks = (type?: string) =>
  apiClient.get('/works', { params: { type } })

export const listMyWorks = (type?: string) =>
  apiClient.get('/works/my', { params: { type } })

export const getWork = (id: number) =>
  apiClient.get(`/works/${id}`)

export const createWork = (data: WorkCreate) =>
  apiClient.post('/works', data)

export const updateWork = (id: number, data: WorkUpdate) =>
  apiClient.put(`/works/${id}`, data)

export const deleteWork = (id: number) =>
  apiClient.delete(`/works/${id}`)

export const publishWork = (id: number) =>
  apiClient.post(`/works/${id}/publish`)
