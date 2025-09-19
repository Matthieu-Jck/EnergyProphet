import { useCallback, useMemo, useState, useEffect } from "react";
import { Country } from "../types";
import { TECHNOLOGIES, TARGET_YEAR, ANNUAL_GROWTH_RATE as ANNUAL_RATE, EPS } from "../utils/constants";
import { clamp, nearlyEqual } from "../utils/helpers";

type AddedByTech = Record<string, number>;

export function useEnergySimulation(country: Country) {
  // --- BASE DATA ---
  const baseProduction = country.totalGenerationTWh;
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, TARGET_YEAR - currentYear);

  const predictedProduction = useMemo(
    () => baseProduction * Math.pow(1 + ANNUAL_RATE, years),
    [baseProduction, years]
  );

  const shareMap = useMemo(
    () => Object.fromEntries(country.technologies.map((t) => [t.id, t.share])),
    [country.technologies]
  );

  const originalGenById = useMemo(
    () =>
      Object.fromEntries(
        TECHNOLOGIES.map((t) => [t.id, (shareMap[t.id] || 0) * baseProduction])
      ),
    [baseProduction, shareMap]
  );

  const unitStepTWh = useMemo(() => {
    const diff = Math.abs(predictedProduction - baseProduction);
    if (diff <= EPS) return Math.max(1e-6, baseProduction * 0.005);
    return Math.max(1e-6, diff / 5);
  }, [predictedProduction, baseProduction]);

  // --- STATE THAT NEEDS RESET ON COUNTRY CHANGE ---
  const [addedByTech, setAddedByTech] = useState<AddedByTech>({});
  const [order, setOrder] = useState<string[]>(() => TECHNOLOGIES.map((t) => t.id));

  // reset state automatically whenever the country changes
  useEffect(() => {
    setAddedByTech({});
    setOrder(
      [...TECHNOLOGIES]
        .sort((a, b) => {
          const sA = country.technologies.find((t) => t.id === a.id)?.share ?? 0;
          const sB = country.technologies.find((t) => t.id === b.id)?.share ?? 0;
          return sB - sA;
        })
        .map((t) => t.id)
    );
  }, [country.id, country.technologies]);

  // --- DERIVED VALUES ---
  const sumValues = useCallback((map: Record<string, number>) =>
    Object.values(map).reduce((s, v) => s + v, 0), []);

  const totalDelta = useMemo(() => sumValues(addedByTech), [addedByTech, sumValues]);
  const newTotalTWh = useMemo(() => baseProduction + totalDelta, [baseProduction, totalDelta]);

  const progress = useMemo(
    () => clamp((newTotalTWh / Math.max(predictedProduction, 1e-9)) * 100, 0, 100),
    [newTotalTWh, predictedProduction]
  );
  const isBalanced = useMemo(() => nearlyEqual(newTotalTWh, predictedProduction), [newTotalTWh, predictedProduction]);
  const hasChanges = useMemo(() => Object.values(addedByTech).some((v) => Math.abs(v) > EPS), [addedByTech]);

  const changes = useMemo(() => {
    const entries: {
      id: string;
      prevShare: number;
      prevTWh: number;
      newShare: number;
      newTWh: number;
    }[] = [];

    for (const id of Object.keys(addedByTech)) {
      const delta = addedByTech[id] || 0;
      if (Math.abs(delta) <= EPS) continue;
      const prevShare = shareMap[id] ?? 0;
      const prevTWh = originalGenById[id] ?? 0;
      const newTWh = Math.max(0, prevTWh + delta);
      const newShare = newTotalTWh > 0 ? newTWh / newTotalTWh : 0;
      entries.push({ id, prevShare, prevTWh, newShare, newTWh });
    }

    return entries;
  }, [addedByTech, shareMap, originalGenById, newTotalTWh]);

  // --- ACTIONS ---
  const adjustTech = useCallback(
    (techId: string, dir: 1 | -1) => {
      setAddedByTech((prev) => {
        const current = prev[techId] || 0;
        const original = originalGenById[techId] ?? 0;
        const minDelta = -original;

        if (dir === 1) {
          const remaining = predictedProduction - (baseProduction + sumValues(prev));
          if (remaining <= EPS) return prev;
          const add = Math.min(unitStepTWh, remaining);
          return { ...prev, [techId]: current + add };
        } else {
          const next = Math.max(current - unitStepTWh, minDelta);
          if (Math.abs(next - current) <= EPS) {
            if (Math.abs(next) <= EPS) {
              const { [techId]: _, ...rest } = prev;
              return rest;
            }
            return prev;
          }
          return { ...prev, [techId]: next };
        }
      });
    },
    [predictedProduction, baseProduction, originalGenById, unitStepTWh, sumValues]
  );

  const handleReset = useCallback(() => setAddedByTech({}), []);

  const resetOrderFromCountry = useCallback(
    (c: Country) => {
      setOrder(
        [...TECHNOLOGIES]
          .sort((a, b) => {
            const sA = c.technologies.find((t) => t.id === a.id)?.share ?? 0;
            const sB = c.technologies.find((t) => t.id === b.id)?.share ?? 0;
            return sB - sA;
          })
          .map((t) => t.id)
      );
    },
    []
  );

  return {
    baseProduction,
    predictedProduction,
    years,
    shareMap,
    originalGenById,
    addedByTech,
    adjustTech,
    handleReset,
    setAddedByTech,
    unitStepTWh,
    totalDelta,
    newTotalTWh,
    progress,
    isBalanced,
    hasChanges,
    changes,
    order,
    setOrder,
    resetOrderFromCountry,
  } as const;
}