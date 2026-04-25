import apiClient from './client'

export interface LearningProject {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  status: string
  progress: number
  completed_count: number
  total_count: number
  sub_projects: {
    id: number
    slug: string
    name: string
    path: string
    status: string
  }[]
  unlock_condition: {
    project_id: number
    status: string
  } | null
}

export const getLearningProjects = () =>
  apiClient.get<LearningProject[]>('/learning/projects')

export const completeProject = (projectId: number) =>
  apiClient.post(`/learning/projects/${projectId}/complete`)

export const completeSubProject = (subProjectId: number) =>
  apiClient.post(`/learning/progress/${subProjectId}/complete`)
