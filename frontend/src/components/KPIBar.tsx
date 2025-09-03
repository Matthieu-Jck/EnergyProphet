// src/components/KPIBar.tsx (minor style improvements for consistency)
import { SimulationResult } from '../types'

interface Props {
    result: SimulationResult
}

export default function KPIBar({ result }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded bg-white shadow">
            <div className="p-2 bg-gray-50 rounded">
                <h3 className="font-semibold text-primary-800">CO₂ Emissions</h3>
                <p className="text-lg">{result.co2Mt.toFixed(2)} Mt</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
                <h3 className="font-semibold text-primary-800">Total Cost</h3>
                <p className="text-lg">${(result.totalCostUsd / 1e9).toFixed(2)} Bn</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
                <h3 className="font-semibold text-primary-800">Imports</h3>
                <ul className="space-y-1">
                    {Object.entries(result.imports).map(([res, qty]) => (
                        <li key={res} className="text-sm">{res}: {qty.toFixed(2)}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}