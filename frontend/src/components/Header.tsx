import { motion } from 'framer-motion'
import CountryPicker from './CountryPicker'
import { Country } from '../types'

interface HeaderProps {
  countries: Country[]
  value: string
  onChange: (id: string) => void
}

function Header({ countries, value, onChange }: HeaderProps) {
  return (
    <header className="relative bg-primary-800 text-white shadow-md z-50">
      {/* Decorative background shape */}
      <div
        className="absolute inset-y-0 left-0 bg-emerald-700/60"
        style={{
          width: '28%',
          clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 container mx-auto px-4 py-2 md:py-4 flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logo button (placeholder for future use) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('Logo button clicked')
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log('Logo button activated')
              }
            }}
            className="rounded-lg p-1 shadow-md hover:bg-white/10 cursor-pointer relative"
          >
            <img
              src="./icons/EnergyProphet.png"
              alt="EnergyProphet Logo"
              className="h-8 w-auto md:h-10"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg font-bold text-white md:text-xl"
          >
            EnergyProphet
          </motion.h1>
        </div>

        {/* Country Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CountryPicker countries={countries} value={value} onChange={onChange} />
        </motion.div>
      </div>
    </header>
  )
}

export default Header