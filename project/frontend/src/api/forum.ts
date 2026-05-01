import apiClient from './client'

export interface ForumTopic {
  id: number
  title: string
  description?: string
  status: string
  post_count: number
  created_by: number
  is_system: boolean
  created_at: string
}

export interface ForumPost {
  id: number
  topic_id: number
  user_id: number
  username: string
  content: string
  stance?: string
  upvotes: number
  downvotes: number
  score: number
  user_vote?: string
  created_at: string
  updated_at: string
}

export interface PostCreate {
  content: string
  stance?: string
}

export interface TopicCreate {
  title: string
  description?: string
}

export const listTopics = () =>
  apiClient.get('/forum/topics')

export const createTopic = (data: TopicCreate) =>
  apiClient.post('/forum/topics', data)

export const closeTopic = (topicId: number) =>
  apiClient.patch(`/forum/topics/${topicId}`, { status: 'closed' })

export const deleteTopic = (topicId: number) =>
  apiClient.delete(`/forum/topics/${topicId}`)

export const listPosts = (topicId: number) =>
  apiClient.get(`/forum/topics/${topicId}/posts`)

export const createPost = (topicId: number, data: PostCreate) =>
  apiClient.post(`/forum/topics/${topicId}/posts`, data)

export const votePost = (postId: number, voteType: string) =>
  apiClient.post(`/posts/${postId}/vote`, { vote_type: voteType })
