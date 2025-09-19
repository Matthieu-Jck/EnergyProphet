import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import CurrentOverview from './components/CurrentOverview'
import VisualRepartition from './components/VisualRepartition'
import LoadingOverlay from './components/LoadingOverlay'
import { Country } from './types'
import { getCountries, getCountry } from './api'
import { useViewportDensity } from './hooks/useViewportDensity'
import { useIsLargeScreen } from './hooks/useIsLargeScreen'
import { useEnergySimulation } from './hooks/useEnergySimulation'

function App() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selected, setSelected] = useState<string>('che')
  const [current, setCurrent] = useState<Country | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [loadingCountries, setLoadingCountries] = useState<boolean>(false)
  const [loadingCountry, setLoadingCountry] = useState<boolean>(false)

  const density = useViewportDensity()
  const isLargeScreen = useIsLargeScreen()

  // Use the hook at the top level, unconditionally
  const simulation = useEnergySimulation(
    current ?? {
      id: "",
      name: "",
      totalGenerationTWh: 0,
      technologies: [],
    }
  )

  // Load countries on mount
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

  // Load selected country
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
    <div
      id="app-root"
      className="h-[100svh] md:h-screen grid grid-rows-[auto,1fr] bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(135deg, #ffffffff, #8dac8dff, #365438ff)'
      }}
    >
      <Header
        countries={countries}
        value={selected}
        onChange={setSelected}
        density={density}
      />

      <main className="p-3 h-full">
        {current && (
          isLargeScreen ? (
            <div className="grid grid-cols-2 gap-6 h-full p-4">
              <div className="max-w-2xl w-full ml-auto">
                <CurrentOverview country={current} simulation={simulation} />
              </div>
              <VisualRepartition country={current} simulation={simulation} />
            </div>
          ) : (
            <CurrentOverview country={current} simulation={simulation} />
          )
        )}
      </main>

      <LoadingOverlay visible={isLoading} message="Loading…" />
    </div>
  )
}

export default App