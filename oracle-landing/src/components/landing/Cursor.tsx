import { useEffect, useRef, useState } from 'react'

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (isTouch) return

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = mx + 'px'
        dotRef.current.style.top  = my + 'px'
      }
    }

    const animate = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top  = ry + 'px'
      }
      raf = requestAnimationFrame(animate)
    }

    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)

    const addListeners = () => {
      document.querySelectorAll('a, button').forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    document.addEventListener('mousemove', onMove)
    addListeners()

    const mo = new MutationObserver(addListeners)
    mo.observe(document.body, { childList: true, subtree: true })

    raf = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      mo.disconnect()
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      {/* Small center dot */}
      <div
        ref={dotRef}
        style={{
          position:      'fixed',
          width:         hovered ? 14 : 8,
          height:        hovered ? 14 : 8,
          background:    hovered ? 'var(--accent2)' : 'var(--accent)',
          borderRadius:  '50%',
          pointerEvents: 'none',
          zIndex:        9999,
          transform:     'translate(-50%, -50%)',
          transition:    'width 0.2s ease, height 0.2s ease, background 0.2s ease',
          mixBlendMode:  'screen',
          willChange:    'left, top',
        }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        style={{
          position:      'fixed',
          width:         hovered ? 40 : 30,
          height:        hovered ? 40 : 30,
          border:        `1px solid ${hovered ? 'rgba(167,139,250,0.65)' : 'rgba(124,109,250,0.4)'}`,
          borderRadius:  '50%',
          pointerEvents: 'none',
          zIndex:        9998,
          transform:     'translate(-50%, -50%)',
          transition:    'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          willChange:    'left, top',
        }}
      />
    </>
  )
}
