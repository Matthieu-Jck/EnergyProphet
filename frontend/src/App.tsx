import { useEffect, useState } from 'react'
import ProjectionChart from './components/ProjectionChart'
import KPIBar from './components/KPIBar'
import CurrentOverview from './components/CurrentOverview'
import PolicyForm from './components/PolicyForm'
import CountryPicker from './components/CountryPicker'
import { Country, PolicyInput, SimulationResult } from './types'
import { getCountries, getCountry, simulatePolicy } from './api'
import { motion } from 'framer-motion'

function App() {
    const [countries, setCountries] = useState<Country[]>([])
    const [selected, setSelected] = useState<string>('che')
    const [current, setCurrent] = useState<Country | null>(null)
    const [result, setResult] = useState<SimulationResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        getCountries()
            .then(data => {
                const filteredCountries = data.filter(
                    c => c.id.toLowerCase() === 'che' || c.id.toLowerCase() === 'fra'
                )
                setCountries(filteredCountries)
                const switzerland = filteredCountries.find(c => c.id.toLowerCase() === 'che')
                if (switzerland) {
                    setSelected(switzerland.id)
                } else if (filteredCountries.length > 0) {
                    setSelected(filteredCountries[0].id)
                }
            })
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
            <header
                className="bg-primary-800 text-white shadow-md"
            >
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0 }}
                        className="text-xl font-bold text-white"
                    >
                        EnergyProphet
                    </motion.h1>
                    <motion.img
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        src="/icons/EnergyProphet.png"
                        alt="EnergyProphet Logo"
                        className="h-10 w-auto"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <CountryPicker
                            countries={countries}
                            value={selected}
                            onChange={setSelected}
                        />
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto p-4 space-y-4">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-red-100 text-red-700 p-4 rounded"
                    >
                        {error}
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-primary-600"
                    >
                        Loading...
                    </motion.div>
                )}

                {current && (
                    <CurrentOverview country={current} />
                )}

                {/*{current && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                    >
                        <PolicyForm country={current} onSimulate={handleSimulate} />
                    </motion.div>
                )}

                {result && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                        >
                            <KPIBar result={result} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.3 }}
                        >
                            <ProjectionChart result={result} />
                        </motion.div>
                    </>
                )} */}
            </main>

            <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="bg-primary-400 text-white shadow-md"
            >
                <div className="container mx-auto px-4 py-4 text-center">
                    <h3 className="text-white">
                        EnergyProphet is an independent website created for educational purposes only.
                        Please note that the information provided may not always be complete, accurate, or up to date.
                        For any inquiries, feel free to contact us at the following address:
                        mjacques.dev@gmail.com
                    </h3>
                </div>
            </motion.footer>
        </div>
    )
}

export default App