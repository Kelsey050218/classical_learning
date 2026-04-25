import { useState, useCallback } from 'react'
import { message } from 'antd'
import apiClient from '../api/client'

interface Chapter {
  id: number
  title: string
  summary: string
  order_index: number
  status: 'unread' | 'reading' | 'completed'
}

interface ChapterProgress {
  chapter_id: number
  status: 'unread' | 'reading' | 'completed'
  progress_percent: number
  started_at?: string
  completed_at?: string
}

interface UseChaptersReturn {
  chapters: Chapter[]
  currentChapter: Chapter | null
  chapterProgress: ChapterProgress[]
  loading: boolean
  fetchChapters: () => Promise<void>
  fetchChapter: (id: number) => Promise<Chapter | null>
  updateChapterProgress: (chapterId: number, status: string, progressPercent: number) => Promise<void>
}

export const useChapters = (): UseChaptersReturn => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [chapterProgress, _setChapterProgress] = useState<ChapterProgress[]>([])
  const [loading, setLoading] = useState(false)

  const fetchChapters = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/reading/chapters')
      setChapters(response.data)
    } catch (error) {
      message.error('加载章节列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchChapter = useCallback(async (id: number): Promise<Chapter | null> => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/reading/chapters/${id}`)
      setCurrentChapter(response.data)
      return response.data
    } catch (error) {
      message.error('加载章节内容失败')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateChapterProgress = useCallback(async (
    chapterId: number,
    status: string,
    progressPercent: number
  ) => {
    try {
      await apiClient.post(`/reading/chapters/${chapterId}/progress`, {
        status,
        progress_percent: progressPercent,
      })
      message.success('进度已保存')
    } catch (error) {
      message.error('保存进度失败')
    }
  }, [])

  return {
    chapters,
    currentChapter,
    chapterProgress,
    loading,
    fetchChapters,
    fetchChapter,
    updateChapterProgress,
  }
}
