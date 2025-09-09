import { useEffect, useState } from 'react'
import Header from './components/Header'
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
    <div className="h-[100svh] md:h-screen grid grid-rows-[auto,1fr] bg-gray-100">
      
      <Header countries={countries} value={selected} onChange={setSelected} />

      <main className="min-h-0 overflow-auto">
        <div className="mx-auto max-w-3xl w-full h-full px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col">
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