// src/App.tsx (modified)
import { useEffect, useState } from 'react'
import ProjectionChart from './components/ProjectionChart'
import KPIBar from './components/KPIBar'
import CurrentOverview from './components/CurrentOverview'
import PolicyForm from './components/PolicyForm'
import CountryPicker from './components/CountryPicker'
import { Country, PolicyInput, SimulationResult } from './types'
import { getCountries, getCountry, simulatePolicy } from './api'

function App() {
    const [countries, setCountries] = useState<Country[]>([])
    const [selected, setSelected] = useState<string>('')
    const [current, setCurrent] = useState<Country | null>(null)
    const [result, setResult] = useState<SimulationResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        getCountries()
            .then(setCountries)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (selected) {
            setLoading(true)
            getCountry(selected)
                .then(setCurrent)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false))
            setResult(null)
        }
    }, [selected])

    const handleSimulate = async (policy: PolicyInput) => {
        try {
            setLoading(true)
            const res = await simulatePolicy(policy)
            setResult(res)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Simulation failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}
            <header className="bg-primary-600 text-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">EnergyProphet</h1>
                    <nav className="space-x-4">
                        {/* Space for menu items; add links or buttons here as needed */}
                        <a href="#" className="hover:underline">Home</a>
                        <a href="#" className="hover:underline">About</a>
                        <a href="#" className="hover:underline">Contact</a>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto p-6 space-y-6">
                {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}
                {loading && <div className="text-primary-600">Loading...</div>}
                <CountryPicker countries={countries} value={selected} onChange={setSelected} />
                {current && (
                    <>
                        <CurrentOverview country={current} />
                        <PolicyForm country={current} onSimulate={handleSimulate} />
                    </>
                )}
                {result && (
                    <>
                        <KPIBar result={result} />
                        <ProjectionChart result={result} />
                    </>
                )}
            </main>
        </div>
    )
}

export default App