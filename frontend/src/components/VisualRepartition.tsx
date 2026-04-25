import React, { useMemo } from "react";
import { Country } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEnergySimulation } from "../hooks/useEnergySimulation";
import { TECHNOLOGIES } from "../utils/constants";

const TECH_GRADIENTS: Record<string, [string, string]> = {
  hydro: ["#2d8ccf", "#163f63"],
  nuclear: ["#4ea475", "#224f3d"],
  solar: ["#f1b34e", "#d9782f"],
  wind: ["#80ced5", "#2e6886"],
  biomass: ["#8ea95a", "#526733"],
  gas: ["#d98d55", "#99612f"],
  coal: ["#6a6d74", "#32363f"],
  oil: ["#bf6c57", "#7a4337"],
};

interface Props {
  country: Country;
  simulation: ReturnType<typeof useEnergySimulation>;
}

export default function VisualRepartition({ country, simulation }: Props) {
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
    <div className="panel-shell flex h-full min-h-0 flex-col p-4 md:p-5">
      <div className="mb-3">
        <h2 className="section-title text-lg md:text-xl">Current Mix Chart</h2>
        <p className="section-copy mt-1 text-sm">
          A live distribution of {country.name}&apos;s scenario across every technology.
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
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
              innerRadius="53%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={2}
              labelLine={false}
              label={() => ``}
              isAnimationActive
              animationDuration={400}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={`url(#grad-${entry.id})`} />
              ))}
            </Pie>

            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                const entry = payload?.[0]?.payload as
                  | { name: string; value: number; generation: number }
                  | undefined;

                if (!active || !entry) return null;

                return (
                  <div className="rounded-[20px] border border-white/15 bg-[#173228]/96 px-4 py-3 text-sm text-[#f8f5ee] shadow-[0_18px_34px_rgba(8,21,16,0.28)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-200/75">
                      {entry.name}
                    </div>
                    <div className="mt-1 font-semibold">{entry.value.toFixed(1)}% share</div>
                    <div className="text-xs text-stone-200/75">
                      {Math.round(entry.generation)} TWh
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-[#d9e3d8] bg-[#faf7ef]/92 text-center shadow-[0_20px_36px_rgba(27,57,46,0.12)] backdrop-blur-sm">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#6b8176]">
              Total
            </span>
            <span className="mt-1 text-lg font-bold text-[#173228]">
              {Math.round(newTotalTWh)}
            </span>
            <span className="text-[11px] text-[#6b8176]">TWh</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((entry) => {
          const [from, to] = TECH_GRADIENTS[entry.id];
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-[18px] border border-white/70 bg-white/68 px-3 py-2 shadow-[0_10px_22px_rgba(27,57,46,0.06)]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                />
                <span className="truncate text-sm font-medium text-[#173228]">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#587061]">
                {entry.value.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
