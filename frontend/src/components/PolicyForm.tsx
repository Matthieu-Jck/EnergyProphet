// src/components/PolicyForm.tsx (minor style improvements for consistency)
import { useState } from 'react'
import { Country, PolicyInput } from '../types'

interface Props {
    country: Country
    onSimulate: (policy: PolicyInput) => void
}

export default function PolicyForm({ country, onSimulate }: Props) {
    const [shares, setShares] = useState<Record<string, number>>(
        Object.fromEntries(country.technologies.map(t => [t.id, t.share]))
    )

    const handleChange = (id: string, value: number) => {
        setShares(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = () => {
        onSimulate({
            countryId: country.id,
            targetYear: 2050,
            shares
        })
    }

    return (
        <div className="border p-4 rounded bg-white shadow space-y-4">
            <h2 className="text-xl font-semibold">Set 2050 Policy</h2>
            {country.technologies.map(t => (
                <div key={t.id} className="flex items-center space-x-2">
                    <label className="w-32 font-medium">{t.name}</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={shares[t.id] ?? 0}
                        onChange={e => handleChange(t.id, parseFloat(e.target.value))}
                        className="border border-gray-300 p-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            ))}
            <button
                onClick={handleSubmit}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
            >
                Simulate
            </button>
        </div>
    )
}