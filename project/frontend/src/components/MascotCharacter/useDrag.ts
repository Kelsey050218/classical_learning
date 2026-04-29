import { useState, useRef, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface DragState {
  position: Position
  isDragging: boolean
}

const MASCOT_SIZE = 160
const CLICK_THRESHOLD = 5

export function useDrag(initialPosition: Position) {
  const [state, setState] = useState<DragState>({
    position: initialPosition,
    isDragging: false,
  })

  const dragStartRef = useRef<{
    mouseX: number
    mouseY: number
    elemX: number
    elemY: number
  } | null>(null)

  const hasDraggedRef = useRef(false)

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value))
  }, [])

  const getBoundedPosition = useCallback((x: number, y: number): Position => {
    const maxX = window.innerWidth - MASCOT_SIZE
    const maxY = window.innerHeight - MASCOT_SIZE
    return {
      x: clamp(x, 0, maxX),
      y: clamp(y, 0, maxY),
    }
  }, [clamp])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      dragStartRef.current = {
        mouseX: clientX,
        mouseY: clientY,
        elemX: state.position.x,
        elemY: state.position.y,
      }
      hasDraggedRef.current = false

      setState((prev) => ({ ...prev, isDragging: true }))
    },
    [state.position]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      const dx = clientX - dragStartRef.current.mouseX
      const dy = clientY - dragStartRef.current.mouseY

      if (Math.abs(dx) > CLICK_THRESHOLD || Math.abs(dy) > CLICK_THRESHOLD) {
        hasDraggedRef.current = true
      }

      const newX = dragStartRef.current.elemX + dx
      const newY = dragStartRef.current.elemY + dy

      setState((prev) => ({
        ...prev,
        position: getBoundedPosition(newX, newY),
      }))
    },
    [getBoundedPosition]
  )

  const handleMouseUp = useCallback(() => {
    dragStartRef.current = null
    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const wasDragged = useCallback(() => {
    return hasDraggedRef.current
  }, [])

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleMouseMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp])

  return {
    position: state.position,
    isDragging: state.isDragging,
    wasDragged,
    handlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleMouseDown,
    },
  }
}
