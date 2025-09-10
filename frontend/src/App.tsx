import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import CurrentOverview from './components/CurrentOverview'
import LoadingOverlay from './components/LoadingOverlay'
import { Country } from './types'
import { getCountries, getCountry } from './api'
import { useViewportDensity } from './hooks/useViewportDensity'

function App() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selected, setSelected] = useState<string>('che')
  const [current, setCurrent] = useState<Country | null>(null)
  const [error, setError] = useState<string | null>(null)

  // loading flags for the two API flows
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false)
  const [loadingCountry, setLoadingCountry] = useState<boolean>(false)

  const density = useViewportDensity()

  // Load countries once on mount
  useEffect(() => {
    let mounted = true
    setLoadingCountries(true)
    setError(null)

    getCountries()
      .then(data => {
        if (!mounted) return
        const filteredCountries = data.filter(c =>
          ['che', 'fra', 'deu', 'ita'].includes(c.id.toLowerCase())
        )
        setCountries(filteredCountries)

        const switzerland = filteredCountries.find(c => c.id.toLowerCase() === 'che')
        if (switzerland) setSelected(switzerland.id)
        else if (filteredCountries.length > 0) setSelected(filteredCountries[0].id)
      })
      .catch(err => {
        if (!mounted) return
        setError(err?.message ?? 'Failed to load countries')
      })
      .finally(() => {
        if (!mounted) return
        setLoadingCountries(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Load selected country whenever selection changes
  useEffect(() => {
    if (!selected) {
      setCurrent(null)
      return
    }

    let mounted = true
    setLoadingCountry(true)
    setError(null)
    // Optionally clear current while loading to avoid stale contents underneath the overlay
    setCurrent(null)

    getCountry(selected)
      .then(data => {
        if (!mounted) return
        setCurrent(data)
      })
      .catch(err => {
        if (!mounted) return
        setError(err?.message ?? 'Failed to load country')
      })
      .finally(() => {
        if (!mounted) return
        setLoadingCountry(false)
      })

    return () => {
      mounted = false
    }
  }, [selected])

  const isLoading = loadingCountries || loadingCountry

  return (
    <div className="h-[100svh] md:h-screen grid grid-rows-[auto,1fr] bg-gray-100">
      <Header
        countries={countries}
        value={selected}
        onChange={setSelected}
        density={density}
      />

      <main className="min-h-0 overflow-auto">
        <div className="mx-auto max-w-3xl w-full h-full px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col relative">
          {error && (
            <div
              role="alert"
              className="bg-red-100 text-red-700 p-4 rounded mb-4"
            >
              {error}
            </div>
          )}

          {/* main content area */}
          <div className="flex-1 min-h-0">
            {current && <CurrentOverview country={current} />}
          </div>

          <LoadingOverlay visible={isLoading} message="Loading…" />
        </div>
      </main>
    </div>
  )
}

export default App