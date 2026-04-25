import apiClient from './client'

export interface ReadingCard {
  id: number
  chapter_id?: number
  card_template: number
  fields: Record<string, string>
  status: string
  created_at: string
  updated_at: string
}

export interface CardCreate {
  card_template: number
  fields: Record<string, string>
  chapter_id?: number
}

export const createCard = (data: CardCreate) =>
  apiClient.post<ReadingCard>('/reading-cards', data)

export const listMyCards = () =>
  apiClient.get<ReadingCard[]>('/reading-cards/my')

export const getCard = (id: number) =>
  apiClient.get<ReadingCard>(`/reading-cards/${id}`)

export const updateCard = (id: number, data: Partial<CardCreate>) =>
  apiClient.put<ReadingCard>(`/reading-cards/${id}`, data)

export const deleteCard = (id: number) =>
  apiClient.delete(`/reading-cards/${id}`)
