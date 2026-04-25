import apiClient from './client'

export interface TodayStudyTimeResponse {
  total_seconds: number
}

export interface WeeklyStudyTimeItem {
  date: string
  day_of_week: string
  total_seconds: number
}

export const logStudyTime = (durationSeconds: number, chapterId?: number) =>
  apiClient.post('/study-time/log', null, {
    params: { duration_seconds: durationSeconds, chapter_id: chapterId },
  })

export const getTodayStudyTime = () =>
  apiClient.get<TodayStudyTimeResponse>('/study-time/today')

export const getWeeklyStudyTime = () =>
  apiClient.get<WeeklyStudyTimeItem[]>('/study-time/weekly')
