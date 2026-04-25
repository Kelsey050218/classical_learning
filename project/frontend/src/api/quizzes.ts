import apiClient from './client'

export interface Quiz {
  id: number
  title: string
  chapter_id?: number
  level: number
  sort_order: number
  description?: string
  pass_score: number
  is_attempted: boolean
  is_passed: boolean
  best_score?: number
}

export interface Question {
  id: number
  question_type: string
  content: string
  options?: string[]
  score: number
  sort_order: number
}

export interface QuizResult {
  quiz_id: number
  score: number
  max_score: number
  is_passed: boolean
  pass_score: number
  results: {
    question_id: number
    is_correct: boolean
    correct_answer: string
    explanation?: string
  }[]
}

export const listQuizzes = () =>
  apiClient.get<Quiz[]>('/quizzes')

export const getQuizQuestions = (quizId: number) =>
  apiClient.get<Question[]>(`/quizzes/${quizId}/questions`)

export const submitQuiz = (quizId: number, answers: Record<number, string>) =>
  apiClient.post<QuizResult>(`/quizzes/${quizId}/submit`, answers)
