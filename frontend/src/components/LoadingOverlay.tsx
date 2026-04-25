import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

type LoadingOverlayProps = {
  visible: boolean
  message?: string
  lockScroll?: boolean
}

export function LoadingOverlay({ visible, message = 'Loading...', lockScroll = true }: LoadingOverlayProps) {
  const overlayFocusRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const originalOverflow = useRef<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const appRoot = document.getElementById('app-root') || document.getElementById('root') || document.body

    if (visible) {
      previouslyFocused.current = document.activeElement as HTMLElement | null
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
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <div
            className="absolute inset-0 bg-[#04120d]/45 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div
            ref={overlayFocusRef}
            tabIndex={-1}
            className="panel-shell-dark relative z-10 flex flex-col items-center gap-3 px-8 py-6 pointer-events-none select-none text-stone-100"
          >
            <div
              className="h-14 w-14 animate-spin rounded-full border-4 border-[#d7e6d4]/80 border-t-[#e7b874]"
              aria-hidden="true"
            />

            <span className="text-sm tracking-[0.12em] text-stone-100" aria-live="polite">
              {message}
            </span>

            <span className="sr-only" aria-live="polite">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default LoadingOverlay
