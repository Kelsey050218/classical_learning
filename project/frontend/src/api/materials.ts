import apiClient from './client'

export interface Materials {
  annotations: {
    id: number
    chapter_id: number
    content: string
    annotation_type: string
    created_at: string
  }[]
  reading_cards: {
    id: number
    chapter_id?: number
    card_template: number
    fields: Record<string, string>
    status: string
    created_at: string
  }[]
  works: {
    id: number
    work_type: string
    title: string
    description?: string
    status: string
    created_at: string
  }[]
}

export const getMaterials = () =>
  apiClient.get<Materials>('/materials')
