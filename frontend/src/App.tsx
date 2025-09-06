import { useEffect, useState } from 'react'
import CurrentOverview from './components/CurrentOverview'
import CountryPicker from './components/CountryPicker'
import { Country } from './types'
import { getCountries, getCountry } from './api'
import { motion } from 'framer-motion'

function App() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selected, setSelected] = useState<string>('che')
  const [current, setCurrent] = useState<Country | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCountries()
      .then(data => {
        const filteredCountries = data.filter(
          c => ['che', 'fra', 'deu', 'ita'].includes(c.id.toLowerCase())
        )
        setCountries(filteredCountries)
        const switzerland = filteredCountries.find(c => c.id.toLowerCase() === 'che')
        if (switzerland) setSelected(switzerland.id)
        else if (filteredCountries.length > 0) setSelected(filteredCountries[0].id)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    if (selected) {
      getCountry(selected)
        .then(setCurrent)
        .catch(err => setError(err.message))
    }
  }, [selected])

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-gray-100">
      <header className="relative bg-primary-800 text-white shadow-md z-50">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-700/60"
          style={{
            width: '28%',
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo button (now just toggles nothing, but preserved for future use) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              role="button"
              tabIndex={0}
              onClick={() => {
                // Placeholder: can be used later
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
                src="/icons/EnergyProphet.png"
                alt="EnergyProphet Logo"
                className="h-10 w-auto"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold text-white"
            >
              EnergyProphet
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CountryPicker
              countries={countries}
              value={selected}
              onChange={setSelected}
            />
          </motion.div>
        </div>
      </header>

      <main className="min-h-0">
        <div className="mx-auto max-w-3xl w-full h-full px-4 py-4 flex flex-col">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-red-100 text-red-700 p-4 rounded mb-4"
            >
              {error}
            </motion.div>
          )}

          {current && (
            <div className="flex-1 min-h-0">
              <CurrentOverview country={current} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App