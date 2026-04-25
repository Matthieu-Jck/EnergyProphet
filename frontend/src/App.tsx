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

  const simulation = useEnergySimulation(
    current ?? {
      id: '',
      name: '',
      totalGenerationTWh: 0,
      technologies: [],
    }
  )

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
    <div id="app-root" className="app-shell relative h-[100svh] overflow-hidden md:h-screen">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,229,188,0.88)_0%,rgba(255,229,188,0)_72%)]" />
        <div className="absolute right-[-8rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(90,135,110,0.24)_0%,rgba(90,135,110,0)_72%)]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.34)_1px,transparent_1px)] [background-size:58px_58px]" />
      </div>

      <div className="relative z-10 grid h-full grid-rows-[auto,1fr]">
        <Header
          countries={countries}
          value={selected}
          onChange={setSelected}
          density={density}
        />

        <main className="h-full min-h-0 p-3 md:p-4">
          {current && (
            isLargeScreen ? (
              <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)] gap-4 xl:gap-5">
                <div className="ml-auto w-full min-w-0 max-w-2xl">
                  <CurrentOverview country={current} simulation={simulation} />
                </div>
                <VisualRepartition country={current} simulation={simulation} />
              </div>
            ) : (
              <CurrentOverview country={current} simulation={simulation} />
            )
          )}

          {!current && error && !isLoading && (
            <div className="panel-shell flex h-full items-center justify-center p-6 text-center">
              <div>
                <h2 className="section-title text-xl">Unable to load the selected country</h2>
                <p className="section-copy mt-2 text-sm">{error}</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <LoadingOverlay visible={isLoading} message="Loading..." />
    </div>
  )
}

export default App
