import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

type LoadingOverlayProps = {
  visible: boolean
  message?: string
  /** If true, prevent the page from scrolling while the overlay is visible */
  lockScroll?: boolean
}

export function LoadingOverlay({ visible, message = 'Loading…', lockScroll = true }: LoadingOverlayProps) {
  const overlayFocusRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const originalOverflow = useRef<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    // prefer an app root id that you control — set id="app-root" on your app container
    const appRoot = document.getElementById('app-root') || document.getElementById('root') || document.body

    if (visible) {
      previouslyFocused.current = document.activeElement as HTMLElement | null
      // focus overlay for screen reader users
      setTimeout(() => overlayFocusRef.current?.focus(), 0)

      if (lockScroll) {
        originalOverflow.current = document.documentElement.style.overflow || ''
        document.documentElement.style.overflow = 'hidden'
      }

      if (appRoot) appRoot.setAttribute('aria-hidden', 'true')
    } else {
      if (previouslyFocused.current) previouslyFocused.current.focus()
      if (lockScroll) document.documentElement.style.overflow = originalOverflow.current ?? ''
      if (appRoot) appRoot.removeAttribute('aria-hidden')
    }

    return () => {
      if (lockScroll) document.documentElement.style.overflow = originalOverflow.current ?? ''
      if (appRoot) appRoot.removeAttribute('aria-hidden')
    }
  }, [visible, lockScroll])

  // don't try to portal on server
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
          // role/dialog + aria-modal makes sense when you're blocking the UI
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          {/* backdrop: fills the viewport and captures pointer events so background is not interactive */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* content (spinner + message). Make it non-interactive (pointer-events-none) since it's purely informational */}
          <div
            ref={overlayFocusRef}
            tabIndex={-1}
            className="relative z-10 flex flex-col items-center gap-3 p-6 pointer-events-none select-none"
          >
            <div
              className="w-14 h-14 rounded-full border-4 border-t-transparent border-gray-300 animate-spin"
              aria-hidden="true"
            />

            <span className="text-sm text-white" aria-live="polite">
              {message}
            </span>

            {/* hidden live region for screen readers (extra accessibility) */}
            <span className="sr-only" aria-live="polite">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default LoadingOverlay