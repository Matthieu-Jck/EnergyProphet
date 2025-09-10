import { motion } from 'framer-motion'
import CountryPicker from './CountryPicker'
import { Country } from '../types'
import { Density } from '../hooks/useViewportDensity'

interface HeaderProps {
    countries: Country[]
    value: string
    onChange: (id: string) => void
    density?: Density
}

function Header({ countries, value, onChange, density = 'normal' }: HeaderProps) {
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

    return (
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
                        onClick={() => console.log('Logo button clicked')}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && console.log('Logo button activated')}
                        className="rounded-lg p-1 shadow-md hover:bg-white/10 cursor-pointer relative"
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
    )
}

export default Header