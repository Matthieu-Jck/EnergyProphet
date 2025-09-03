// src/components/ProjectionChart.tsx (minor style improvements for consistency)
import { SimulationResult } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
    result: SimulationResult
}

export default function ProjectionChart({ result }: Props) {
    const data = Object.entries(result.generationTWh).map(([tech, value]) => ({
        technology: tech,
        generation: value
    }))

    return (
        <div className="border p-4 rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">2050 Energy Projection</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="technology" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="generation" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}