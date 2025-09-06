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
      <header className="relative bg-primary-800 text-white shadow-md overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-700/60"
          style={{
            width: '28%',
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-bold text-white"
          >
            EnergyProphet
          </motion.h1>
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            src="/icons/EnergyProphet.png"
            alt="EnergyProphet Logo"
            className="h-10 w-auto"
          />
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
