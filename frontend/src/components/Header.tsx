import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountryPicker from './CountryPicker'
import { Country } from '../types'
import { Density } from '../hooks/useViewportDensity'

interface HeaderProps {
  countries: Country[]
  value: string
  onChange: (id: string) => void
  density?: Density
}

export default function Header({ countries, value, onChange, density = 'normal' }: HeaderProps) {
  const densityStyles = {
    normal: {
      header: 'h-20 md:h-24',
      container: 'px-4 md:px-6',
      logo: 'h-9 md:h-11',
      title: 'text-xl md:text-2xl',
      gap: 'gap-3 md:gap-4',
    },
    compact: {
      header: 'h-16 md:h-20',
      container: 'px-3 md:px-5',
      logo: 'h-7 md:h-9',
      title: 'text-lg md:text-xl',
      gap: 'gap-2 md:gap-3',
    },
    ultra: {
      header: 'h-12 md:h-16',
      container: 'px-2 md:px-4',
      logo: 'h-6 md:h-8',
      title: 'text-base md:text-lg',
      gap: 'gap-2',
    },
  } as const

  const styles = densityStyles[density]

  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const firstInteractiveRef = useRef<HTMLButtonElement | null>(null)

  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => firstInteractiveRef.current?.focus(), 80)
    }
  }, [open])

  const sections = [
    {
      title: 'About',
      content: (
        <>
          <p>
            EnergyProphet is an independent, educational website that shows the electricity
            production for different countries. You can explore data and decide what energy mix
            we should use for <strong>2050</strong>.
          </p>
          <p className="mt-2">
            Our AI analyzes your choices to provide insights. Please note that data may be
            <em> missing or outdated</em>. We apologize for inaccuracies.
          </p>
        </>
      ),
    },
    {
      title: 'Resources',
      content: (
        <ul className="list-disc list-inside space-y-1">
          <li><a className="underline decoration-[#f2d4aa]/70 underline-offset-4 hover:text-[#f2d4aa]" href="https://app.electricitymaps.com/map/72h/hourly" target="_blank" rel="noreferrer">Electricity Maps</a></li>
          <li><a className="underline decoration-[#f2d4aa]/70 underline-offset-4 hover:text-[#f2d4aa]" href="https://www.iea.org/" target="_blank" rel="noreferrer">International Energy Agency</a></li>
          <li><a className="underline decoration-[#f2d4aa]/70 underline-offset-4 hover:text-[#f2d4aa]" href="https://ourworldindata.org/energy" target="_blank" rel="noreferrer">Our World in Data</a></li>
        </ul>
      ),
    },
    {
      title: 'Contact',
      content: (
        <p>
          Email me at{' '}
          <a href="mailto:mjacques.dev@gmail.com" className="underline decoration-[#f2d4aa]/70 underline-offset-4 hover:text-[#f2d4aa]">
            mjacques.dev@gmail.com
          </a>
        </p>
      ),
    },
    {
      title: 'Terms',
      content: (
        <p className="text-center">
          This website is provided for educational purposes only. It comes with no warranty.
          By using EnergyProphet, you agree that data may be incomplete or inaccurate and should
          not be used for critical decisions. Copyright 2025 Matthieu Jacques.
        </p>
      ),
    },
  ]

  return (
    <>
      <header className={`relative z-50 border-b border-white/15 bg-[linear-gradient(120deg,rgba(18,40,33,0.98),rgba(36,74,59,0.92),rgba(86,129,104,0.78))] text-white shadow-[0_20px_54px_rgba(10,24,19,0.28)] backdrop-blur-xl ${styles.header}`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-[32%] bg-[linear-gradient(90deg,rgba(242,212,170,0.24),rgba(242,212,170,0))]" />
          <div className="absolute -bottom-10 left-24 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-20 top-[-3.5rem] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className={`relative z-10 flex h-full w-full items-center justify-between ${styles.container}`}>
          <div className={`flex items-center ${styles.gap}`}>
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setOpen(true)}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-[0_12px_28px_rgba(6,18,14,0.22)] transition hover:bg-white/14 focus:outline-none focus:ring-2 focus:ring-[#f2d4aa]/60"
              aria-expanded={open}
              aria-controls="side-menu"
              aria-label="Open information menu"
            >
              <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] opacity-90" aria-hidden />
              <img src="./icons/EnergyProphet.png" alt="EnergyProphet Logo" className={`${styles.logo} relative z-10 w-auto transition duration-300 group-hover:scale-[1.02]`} />
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`font-bold tracking-[-0.05em] text-white drop-shadow-sm ${styles.title}`}
            >
              EnergyProphet
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="min-w-[150px]"
          >
            <CountryPicker
              countries={countries}
              value={value}
              onChange={onChange}
              density={density}
            />
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#04120d]/55 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <motion.aside
              id="side-menu"
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="panel-shell-dark fixed bottom-0 left-0 top-0 z-50 flex w-80 flex-col overflow-hidden p-6 text-stone-100 md:w-96 md:p-7"
              role="dialog"
              aria-modal="true"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-[#f2d4aa]/10 blur-3xl" />
                <div className="absolute bottom-[-4rem] right-[-3rem] h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className={`relative z-10 mb-6 flex items-center justify-between ${styles.gap}`}>
                <div className={`flex items-center ${styles.gap}`}>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-2 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                    <img src="./icons/EnergyProphet.png" alt="EnergyProphet" className={`${styles.logo} w-auto rounded-sm`} />
                  </div>
                  <div>
                    <h3 className={`font-bold tracking-[-0.04em] text-white ${styles.title}`}>EnergyProphet</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-200/70">
                      Energy foresight tool
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  ref={firstInteractiveRef}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/8 p-2 transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-[#f2d4aa]/50"
                  aria-label="Close menu"
                >
                  <span className="text-lg font-semibold leading-none">x</span>
                </button>
              </div>

              <nav className="relative z-10 flex flex-grow flex-col gap-3" aria-label="Main menu">
                {sections.map(section => (
                  <div key={section.title}>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-[#f2d4aa]/40"
                      aria-expanded={expanded === section.title}
                    >
                      <span className="flex items-center justify-between">
                        <span>{section.title}</span>
                        <span className="text-lg leading-none">{expanded === section.title ? '-' : '+'}</span>
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded === section.title && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 rounded-2xl border border-white/10 bg-black/12 px-4 py-3 text-sm opacity-95 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                            {section.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              <div className="relative z-10 mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-stone-100/80">
                <a className="footer_licence flex items-center gap-2 hover:underline" href="https://github.com/Matthieu-Jck/EnergyProphet/blob/main/LICENSE" target="_blank" rel="noreferrer">
                  <span>Matthieu Jacques</span>
                  <img src="./icons/open-source-icon.svg" alt="license" width="20px" height="20px" />
                  <span>MIT license 2025</span>
                </a>
                <a className="flex items-center gap-2 hover:underline" href="https://github.com/matthieu-jck/EnergyProphet" target="_blank" rel="noreferrer">
                  <span>See source code on my GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.05 20.31" className="h-4 w-4 fill-current">
                    <path d="M7.26 16.34c-4.11 1.23-4.11-2.06-5.76-2.47M13 18.81V15.62a2.78 2.78 0 0 0-.77-2.15c2.59-.28 5.3-1.26 5.3-5.76a4.46 4.46 0 0 0-1.23-3.08 4.18 4.18 0 0 0-.08-3.11s-1-.29-3.22 1.22a11 11 0 0 0-5.76 0C5 1.23 4 1.52 4 1.52A4.18 4.18 0 0 0 4 4.63 4.48 4.48 0 0 0 2.73 7.74c0 4.46 2.72 5.44 5.31 5.76a2.8 2.8 0 0 0-.78 2.12v3.19" />
                  </svg>
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
