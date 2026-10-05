import { forwardRef, useEffect, useRef } from 'react'

function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else ref.current = node
    }
  }
}

// Fades + slides a section up as it scrolls into view. SSR/no-JS always
// renders the final visible state (no inline opacity so crawlers and the
// pre-hydration paint see real content, not a blank section) - only after
// mount, and only for sections not already in the initial viewport, does it
// briefly hide itself and reveal via IntersectionObserver on scroll.
export const Reveal = forwardRef(function Reveal(
  { children, as: Tag = 'div', className = '', delay = 0, y = 24, ...rest },
  forwardedRef
) {
  const localRef = useRef(null)

  useEffect(() => {
    const el = localRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const alreadyInView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0
    if (alreadyInView) return // stays at its default visible state
    // Respect the OS "reduce motion" setting: no hide/slide at all.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`

    // threshold 0 = reveal as soon as any part is on screen. A ratio threshold
    // (e.g. 0.2) never fires for sections taller than ~5 screens, which is
    // common on phones, and left those sections permanently invisible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.transition = `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`
        el.style.opacity = '1'
        el.style.transform = 'none'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Tag ref={mergeRefs(localRef, forwardedRef)} className={className} {...rest}>
      {children}
    </Tag>
  )
})

export default Reveal
