import apiClient from './client'

export interface Evaluation {
  id: number
  project_id: number
  form_type: string
  scores: Record<string, number>
  self_comment?: string
  evaluator_comment?: string
  created_at: string
  updated_at: string
}

export const createEvaluation = (data: {
  project_id: number
  form_type: string
  scores: Record<string, number>
  self_comment?: string
}) =>
  apiClient.post<Evaluation>('/evaluations', data)

export const listMyEvaluations = (projectId?: number) =>
  apiClient.get<Evaluation[]>('/evaluations/my', {
    params: projectId ? { project_id: projectId } : undefined,
  })
