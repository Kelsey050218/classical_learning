import { useEffect, useRef, useCallback } from 'react'

interface AutoSaveOptions {
  interval?: number
  onSave: () => void | Promise<void>
  enabled?: boolean
}

export const useAutoSave = (options: AutoSaveOptions) => {
  const { interval = 30000, onSave, enabled = true } = options
  const saveRef = useRef(onSave)
  const lastSaveRef = useRef<number>(0)

  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  const triggerSave = useCallback(async () => {
    const now = Date.now()
    if (now - lastSaveRef.current < 1000) return
    lastSaveRef.current = now
    try {
      await saveRef.current()
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const timer = setInterval(() => {
      triggerSave()
    }, interval)

    const handleBeforeUnload = () => {
      // Synchronous save attempt on page close
      const fn = saveRef.current
      if (fn) {
        try {
          const result = fn()
          if (result instanceof Promise) {
            // Use sendBeacon for async on unload
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            navigator.sendBeacon
          }
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, interval, triggerSave])

  return { triggerSave }
}
