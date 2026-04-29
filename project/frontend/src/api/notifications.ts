import apiClient from './client'

export interface NotificationItem {
  id: number
  user_id: number
  notification_type: 'like' | 'comment' | 'pinned' | 'unlisted' | 'vote_open' | 'vote_close' | 'system'
  title: string
  content?: string
  is_read: boolean
  related_id?: number
  related_type?: string
  created_at: string
}

export const listNotifications = () =>
  apiClient.get('/notifications')

export const getUnreadCount = () =>
  apiClient.get('/notifications/unread-count')

export const markAsRead = (id: number) =>
  apiClient.put(`/notifications/${id}/read`)

export const markAllAsRead = () =>
  apiClient.put('/notifications/read-all')
