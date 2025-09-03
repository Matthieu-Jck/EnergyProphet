// src/components/CurrentOverview.tsx (modified to include country map)
import { Country } from '../types'

interface Props {
    country: Country
}

export default function CurrentOverview({ country }: Props) {
    return (
        <div className="border p-4 rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-2">Current Energy Mix ({country.name})</h2>
            {/* Display country map; assumes PNG files are named after country.id in lowercase, e.g., 'usa.png' */}
            <img 
                src={`src/public/maps/${country.id.toLowerCase()}.png`} 
                alt={`${country.name} map`} 
                className="w-full max-w-md mx-auto mb-4 rounded shadow" 
            />
            <ul className="space-y-1">
                {country.technologies.map(t => (
                    <li key={t.id}>{t.name}: {(t.share * 100).toFixed(1)}%</li>
                ))}
            </ul>
        </div>
    )
}