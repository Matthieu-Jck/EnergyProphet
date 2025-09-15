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

    // Side menu state
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const firstInteractiveRef = useRef<HTMLButtonElement | null>(null)

    // Expandable sections
    const [expanded, setExpanded] = useState<string | null>(null)

    const toggleSection = (section: string) => {
        setExpanded(expanded === section ? null : section)
    }

    // Close on ESC
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    // Close on outside click
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

    // Focus first interactive element when opening
    useEffect(() => {
        if (open) {
            setTimeout(() => firstInteractiveRef.current?.focus(), 80)
        }
    }, [open])

    return (
        <>
            <header className={`relative bg-primary-800 text-white shadow-md z-50 ${styles.header}`}>
                {/* Decorative background shape */}
                <div
                    className="absolute inset-y-0 left-0 bg-emerald-700/60"
                    style={{ width: '28%', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                    aria-hidden
                />

                <div
                    className={`relative z-10 container mx-auto h-full flex justify-between items-center ${styles.container}`}
                >
                    {/* Logo + Title */}
                    <div className={`flex items-center ${styles.gap}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            role="button"
                            tabIndex={0}
                            onClick={() => setOpen(true)}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
                            className="rounded-lg p-1 shadow-md cursor-pointer relative border border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                            aria-expanded={open}
                            aria-controls="side-menu"
                            aria-label={open ? 'Close menu' : 'Open menu'}
                        >
                            <img src="./icons/EnergyProphet.png" alt="EnergyProphet Logo" className={`${styles.logo} w-auto`} />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`font-bold text-white ${styles.title}`}
                        >
                            EnergyProphet
                        </motion.h1>
                    </div>

                    {/* Country Picker */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <CountryPicker
                            countries={countries}
                            value={value}
                            onChange={onChange}
                            density={density}
                        />
                    </motion.div>
                </div>
            </header>

            {/* Side menu + backdrop */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.45 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black z-40"
                            onClick={() => setOpen(false)}
                            aria-hidden
                        />

                        {/* Sliding panel */}
                        <motion.aside
                            id="side-menu"
                            ref={menuRef}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 bottom-0 z-50 w-72 md:w-80 bg-gradient-to-b from-primary-900 to-emerald-700/95 text-white shadow-2xl p-6 flex flex-col"
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Mirror header inside menu */}
                            <div className={`flex items-center justify-between mb-6 ${styles.gap}`}>
                                <div className={`flex items-center ${styles.gap}`}>
                                    <img src="./icons/EnergyProphet.png" alt="EnergyProphet" className={`${styles.logo} w-auto rounded-sm shadow-sm`} />
                                    <h3 className={`font-bold ${styles.title}`}>EnergyProphet</h3>
                                </div>

                                <button
                                    ref={firstInteractiveRef}
                                    onClick={() => setOpen(false)}
                                    className="rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    aria-label="Close menu"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Main navigation */}
                            <nav className="flex flex-col gap-3 flex-grow" aria-label="Main menu">
                                {[
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
                                        title: 'Ressources',
                                        content: (
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><a className="underline hover:text-emerald-300" href="https://app.electricitymaps.com/map/72h/hourly" target="_blank">Electricity Maps</a></li>
                                                <li><a className="underline hover:text-emerald-300" href="https://www.iea.org/" target="_blank">International Energy Agency</a></li>
                                                <li><a className="underline hover:text-emerald-300" href="https://ourworldindata.org/energy" target="_blank">Our World in Data</a></li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        title: 'Contact',
                                        content: (
                                            <p>Email me at <a href="mailto:mjacques.dev@gmail.com" className="underline hover:text-emerald-300">mjacques.dev@gmail.com</a></p>
                                        ),
                                    },
                                    {
                                        title: 'Terms',
                                        content: (
                                            <p className='text-center'>
                                                This website is provided for educational purposes only. It comes with no warranty.
                                                By using EnergyProphet, you agree that data may be incomplete or inaccurate and should
                                                not be used for critical decisions. © 2025 Matthieu Jacques.
                                            </p>
                                        ),
                                    },
                                ].map(section => (
                                    <div key={section.title}>
                                        <button
                                            onClick={() => toggleSection(section.title)}
                                            className="w-full flex justify-between items-center rounded-lg px-4 py-3 text-sm font-medium bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            aria-expanded={expanded === section.title}
                                        >
                                            {section.title}
                                            <span className="text-lg">{expanded === section.title ? '−' : '+'}</span>
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
                                                    <div className="mt-1 bg-white/10 rounded-lg px-4 py-3 text-sm opacity-90 shadow-md border border-white/10">
                                                        {section.content}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-white/10 text-xs opacity-80 flex flex-col gap-2">
                                <a className="footer_licence flex items-center gap-2 hover:underline" href="https://github.com/Matthieu-Jck/EnergyProphet/blob/main/LICENSE" target="_blank">
                                    <span>© Matthieu Jacques</span>
                                    <img src="./icons/open-source-icon.svg" alt="license" width="20px" height="20px" />
                                    <span>MIT license 2025</span>
                                </a>
                                <a className="flex items-center gap-2 hover:underline" href="https://github.com/matthieu-jck/EnergyProphet" target="_blank">
                                    <span>See source code on my GitHub</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.05 20.31" className="w-4 h-4 fill-current">
                                        <path
                                            d="M7.26 16.34c-4.11 1.23-4.11-2.06-5.76-2.47M13 18.81V15.62a2.78 2.78 0 0 0-.77-2.15c2.59-.28 5.3-1.26 5.3-5.76a4.46 4.46 0 0 0-1.23-3.08 4.18 4.18 0 0 0-.08-3.11s-1-.29-3.22 1.22a11 11 0 0 0-5.76 0C5 1.23 4 1.52 4 1.52A4.18 4.18 0 0 0 4 4.63 4.48 4.48 0 0 0 2.73 7.74c0 4.46 2.72 5.44 5.31 5.76a2.8 2.8 0 0 0-.78 2.12v3.19"
                                        />
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