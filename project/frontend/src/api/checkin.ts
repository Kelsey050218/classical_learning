import apiClient from './client'

export interface CheckInStatus {
  is_checked_in_today: boolean
  total_checkins: number
  max_consecutive_days: number
  current_consecutive_days: number
  checkins: {
    date: string
    consecutive_days: number
    content?: string
  }[]
}

export const checkIn = (content?: string) =>
  apiClient.post<{ checkin_date: string; consecutive_days: number }>('/checkin', { content })

export const getCheckInStatus = () =>
  apiClient.get<CheckInStatus>('/checkin')

export const getCheckInCalendar = (year: number, month: number) =>
  apiClient.get<{ year: number; month: number; checkin_dates: number[] }>('/checkin/calendar', {
    params: { year, month },
  })
