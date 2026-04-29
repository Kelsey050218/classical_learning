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
  is_pinned: boolean
  is_unlisted: boolean
  view_count: number
  like_count: number
  user_liked: boolean
  vote_counts?: Record<string, number>
  created_at: string
  updated_at: string
}

export const listWorks = (work_type?: string, sort_by?: string) =>
  apiClient.get('/works', { params: { work_type, sort_by } })

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

export const pinWork = (id: number) =>
  apiClient.put(`/works/${id}/pin`)

export const unlistWork = (id: number) =>
  apiClient.put(`/works/${id}/unlist`)

export const likeWork = (id: number) =>
  apiClient.post(`/works/${id}/like`)

export const getWorkVotes = (id: number) =>
  apiClient.get(`/works/${id}/votes`)

export const voteWork = (id: number, award_type: string) =>
  apiClient.post(`/works/${id}/vote`, null, { params: { award_type } })

export const getVoteSettings = () =>
  apiClient.get('/works/vote/settings')

export const updateVoteSettings = (is_voting_open: boolean) =>
  apiClient.put('/works/vote/settings', { is_voting_open })

export interface WorkComment {
  id: number
  work_id: number
  user_id: number
  username: string
  content: string
  created_at: string
}

export const getWorkComments = (id: number) =>
  apiClient.get(`/works/${id}/comments`)

export const createWorkComment = (id: number, content: string) =>
  apiClient.post(`/works/${id}/comments`, { content })

export const deleteWorkComment = (workId: number, commentId: number) =>
  apiClient.delete(`/works/${workId}/comments/${commentId}`)

