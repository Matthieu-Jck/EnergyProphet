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

  const [loadingCountries, setLoadingCountries] = useState<boolean>(false)
  const [loadingCountry, setLoadingCountry] = useState<boolean>(false)

  const density = useViewportDensity()

  useEffect(() => {
    let mounted = true
    setLoadingCountries(true)
    setError(null)

    getCountries()
      .then(data => {
        if (!mounted) return
        const filtered = data.filter(c => ['che', 'fra', 'deu', 'ita'].includes(c.id.toLowerCase()))
        setCountries(filtered)

        const switzerland = filtered.find(c => c.id.toLowerCase() === 'che')
        if (switzerland) setSelected(switzerland.id)
        else if (filtered.length > 0) setSelected(filtered[0].id)
      })
      .catch(err => {
        if (!mounted) return
        setError(err?.message ?? 'Failed to load countries')
      })
      .finally(() => {
        if (!mounted) return
        setLoadingCountries(false)
      })

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selected) {
      setCurrent(null)
      return
    }

    let mounted = true
    setLoadingCountry(true)
    setError(null)
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

    return () => { mounted = false }
  }, [selected])

  const isLoading = loadingCountries || loadingCountry

  return (
    <div id="app-root" className="h-[100svh] md:h-screen grid grid-rows-[auto,1fr] bg-gray-100">
      <Header
        countries={countries}
        value={selected}
        onChange={setSelected}
        density={density}
      />

      <main className="min-h-0 overflow-auto">
        <div className="mx-auto max-w-3xl w-full h-full px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col relative">
          {error && (
            <div role="alert" className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 min-h-0">
            {current && <CurrentOverview country={current} />}
          </div>
        </div>
      </main>

      <LoadingOverlay visible={isLoading} message="Loading…" />
    </div>
  )
}

export default App