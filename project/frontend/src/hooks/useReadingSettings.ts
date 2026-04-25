import { useState, useEffect, useCallback } from 'react'

export interface ReadingSettings {
  fontSize: 'base' | 'lg' | 'xl'
  lineSpacing: 'normal' | 'relaxed' | 'loose'
  nightMode: boolean
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 'base',
  lineSpacing: 'relaxed',
  nightMode: false,
}

const STORAGE_KEY = 'reading_settings'

export const useReadingSettings = () => {
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch {
      // ignore parse error
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    // Toggle dark class on html element for tailwind dark mode
    if (settings.nightMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const updateSettings = useCallback((partial: Partial<ReadingSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
  }, [])

  const fontSizeClass =
    settings.fontSize === 'base'
      ? 'text-base'
      : settings.fontSize === 'lg'
      ? 'text-lg'
      : 'text-xl'

  const lineSpacingClass =
    settings.lineSpacing === 'normal'
      ? 'leading-normal'
      : settings.lineSpacing === 'relaxed'
      ? 'leading-relaxed'
      : 'leading-loose'

  return {
    settings,
    updateSettings,
    fontSizeClass,
    lineSpacingClass,
  }
}
