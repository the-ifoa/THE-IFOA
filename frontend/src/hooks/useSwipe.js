import { useRef } from 'react'

// Touch handlers for a carousel: a mostly-horizontal swipe of at least
// `threshold` px calls onNext (swipe left) or onPrev (swipe right). Vertical
// swipes are ignored so the page still scrolls.
export function useSwipe(onPrev, onNext, threshold = 50) {
  const start = useRef(null)

  return {
    onTouchStart: (e) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) onNext()
      else onPrev()
    }
  }
}
