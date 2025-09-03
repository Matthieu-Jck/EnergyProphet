// src/components/CountryPicker.tsx (minor style improvements for consistency)
import { Country } from '../types'

interface Props {
    countries: Country[]
    value: string
    onChange: (id: string) => void
}

export default function CountryPicker({ countries, value, onChange }: Props) {
    return (
        <select
            className="border border-gray-300 rounded p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            <option value="">Select country...</option>
            {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
    )
}