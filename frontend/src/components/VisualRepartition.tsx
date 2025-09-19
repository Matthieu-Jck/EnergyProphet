import React, { useMemo } from "react";
import { Country } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useEnergySimulation } from "../hooks/useEnergySimulation";
import { TECHNOLOGIES } from "../utils/constants";

// More vibrant and distinct gradient colors per technology
const TECH_GRADIENTS: Record<string, [string, string]> = {
  hydro: ["#0091ffff", "#001a4dff"],       // deep blue gradient
  nuclear: ["#11e05dff", "#2f8265ff"],     // dark green gradient
  solar: ["#ffa600ff", "#fffc49ff"],       // bright yellow-orange gradient
  wind: ["#5fccffff", "#cbd4d8ff"],        // vibrant sky blue gradient
  biomass: ["#5e9904ff", "#103100ff"],     // earthy green gradient
  gas: ["#ff6a00ff", "#914104ff"],         // warm orange gradient
  coal: ["#716a62ff", "#18222fff"],        // charcoal gray gradient
  oil: ["#ff4848ff", "#b44141ff"],         // deep rose gradient
};

interface Props {
  country: Country;
  simulation: ReturnType<typeof useEnergySimulation>;
}

export default function VisualRepartition({ simulation }: Props) {
  const { newTotalTWh, order, originalGenById, addedByTech } = simulation;

  const data = useMemo(() => {
    return order
      .map((id) => {
        const tech = TECHNOLOGIES.find((t) => t.id === id)!;
        const baseTWh = originalGenById[id] || 0;
        const delta = addedByTech[id] || 0;
        const newTWh = Math.max(0, baseTWh + delta);
        const share = newTotalTWh > 0 ? (newTWh / newTotalTWh) * 100 : 0;
        return {
          id,
          name: tech.name,
          value: share,
          generation: newTWh,
        };
      })
      .filter((d) => d.value > 0);
  }, [order, originalGenById, addedByTech, newTotalTWh]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-emerald-800 mb-3 text-center">
        Current Mix Chart
      </h2>

      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {Object.entries(TECH_GRADIENTS).map(([id, [from, to]]) => (
                <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={from} />
                  <stop offset="100%" stopColor={to} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              labelLine={false}
              label={({}) => ``}
              isAnimationActive
              animationDuration={400}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={`url(#grad-${entry.id})`} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}