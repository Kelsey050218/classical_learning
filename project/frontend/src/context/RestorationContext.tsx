import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Progress, listChapters, getProgress, RestorationChapter } from '../api/restoration'

interface RestorationContextType {
  chapters: RestorationChapter[]
  progressMap: Record<number, Progress>
  loading: boolean
  refresh: () => Promise<void>
  updateProgress: (chapterId: number, patch: Partial<Progress>) => void
}

const RestorationContext = createContext<RestorationContextType | undefined>(undefined)

export const RestorationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<RestorationChapter[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, Progress>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [chRes, prRes] = await Promise.all([
        listChapters(),
        getProgress(),
      ])
      setChapters(chRes.data)
      setProgressMap(Object.fromEntries(prRes.data.map(p => [p.chapter_id, p])))
    } catch (err) {
      console.error('Failed to load restoration data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateProgress = useCallback((chapterId: number, patch: Partial<Progress>) => {
    setProgressMap(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], ...patch } as Progress,
    }))
  }, [])

  return (
    <RestorationContext.Provider value={{ chapters, progressMap, loading, refresh, updateProgress }}>
      {children}
    </RestorationContext.Provider>
  )
}

export function useRestoration() {
  const ctx = useContext(RestorationContext)
  if (!ctx) throw new Error('useRestoration must be used within RestorationProvider')
  return ctx
}
