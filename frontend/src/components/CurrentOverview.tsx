import React from "react";
import { Country } from "../types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import InfoPanel from "./InfoPanel";
import AnalyzeButton from "./AnalyzeButton";
import TechCard, { DisplayTech } from "./TechCard";
import { EPS, TARGET_YEAR, ANNUAL_GROWTH_RATE } from "../utils/constants";
import { nearlyEqual, formatEnergy, clamp } from "../utils/helpers";
import { useViewportDensity } from "../hooks/useViewportDensity";

interface Props {
  country: Country;
  onSimulate?: () => void;
}

const ANNUAL_RATE = ANNUAL_GROWTH_RATE;

export default function CurrentOverview({ country, onSimulate }: Props) {
  const [openTechId, setOpenTechId] = useState<string | null>(null);
  const [addedByTech, setAddedByTech] = useState<Record<string, number>>({});
  const [firstLoad, setFirstLoad] = useState(true);
  const [showAnalyzeTip, setShowAnalyzeTip] = useState(false);
  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [analyzePulseKey, setAnalyzePulseKey] = useState(0);
  const prevDelayedBalancedRef = useRef(false);

  const prevCountryIdRef = useRef<string>(country.id);
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allTechnologies = useMemo(
    () => [
      { id: "hydro", name: "Hydro" },
      { id: "nuclear", name: "Nuclear" },
      { id: "solar", name: "Solar" },
      { id: "wind", name: "Wind" },
      { id: "biomass", name: "Biomass" },
      { id: "coal", name: "Coal" },
      { id: "oil", name: "Oil" },
      { id: "gas", name: "Gas" },
    ],
    []
  );

  const techInfo: Record<string, { green: boolean; controllable: boolean; co2: number; cost: number }> = {
    hydro: { green: true, controllable: true, co2: 5, cost: 40 },
    nuclear: { green: true, controllable: true, co2: 12, cost: 60 },
    solar: { green: true, controllable: false, co2: 20, cost: 50 },
    wind: { green: true, controllable: false, co2: 15, cost: 45 },
    biomass: { green: true, controllable: true, co2: 100, cost: 55 },
    coal: { green: false, controllable: true, co2: 820, cost: 70 },
    oil: { green: false, controllable: true, co2: 650, cost: 75 },
    gas: { green: false, controllable: true, co2: 450, cost: 55 },
  };

  const stableOrderRef = useRef<string[]>(allTechnologies.map((t) => t.id));
  const baseProduction = country.totalGenerationTWh;
  const years = TARGET_YEAR - 2025;
  const predictedProduction = useMemo(
    () => baseProduction * Math.pow(1 + ANNUAL_RATE, years),
    [baseProduction, years]
  );
  const goalDelta = predictedProduction - baseProduction;
  const unitStepTWh = goalDelta / 5; // 20% steps

  const shareMap: Record<string, number> = useMemo(
    () => Object.fromEntries(country.technologies.map((t) => [t.id, t.share])),
    [country.technologies]
  );

  const originalGenById: Record<string, number> = useMemo(
    () =>
      Object.fromEntries(
        allTechnologies.map((t) => [t.id, (shareMap[t.id] || 0) * baseProduction])
      ),
    [allTechnologies, shareMap, baseProduction]
  );

  // reset per-country
  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      setAddedByTech({});
      setOpenTechId(null);
      prevCountryIdRef.current = country.id;
      stableOrderRef.current = [...allTechnologies]
        .sort((a, b) => (shareMap[b.id] || 0) - (shareMap[a.id] || 0))
        .map((t) => t.id);
    }
  }, [country.id, allTechnologies, shareMap]);

  useEffect(() => setFirstLoad(false), []);

  const totalDelta = useMemo(
    () => Object.values(addedByTech).reduce((s, v) => s + v, 0),
    [addedByTech]
  );
  const newTotalTWh = baseProduction + totalDelta;

  const displayTechs: DisplayTech[] = useMemo(() => {
    return stableOrderRef.current.map((id, revealIndex) => {
      const base = allTechnologies.find((t) => t.id === id)!;
      const originalShare = shareMap[id] || 0;
      const originalTWh = originalGenById[id] || 0;
      const delta = addedByTech[id] || 0;
      const newTWh = Math.max(0, originalTWh + delta);
      const newShare = newTotalTWh > 0 ? newTWh / newTotalTWh : 0;

      const shareColor =
        newShare > originalShare ? "text-emerald-700" : newShare < originalShare ? "text-red-600" : "text-gray-800";
      const genColor =
        newTWh > originalTWh ? "text-emerald-700" : newTWh < originalTWh ? "text-red-600" : "text-gray-800";
      const trend: "up" | "down" | "none" =
        newShare > originalShare + EPS ? "up" : newShare < originalShare - EPS ? "down" : "none";

      return {
        ...base,
        share: newShare,
        shareColor,
        generationTWh: newTWh,
        genColor,
        revealIndex,
        trend,
      } as const;
    });
  }, [addedByTech, allTechnologies, originalGenById, newTotalTWh, shareMap]);

  const leftColumn = useMemo(() => displayTechs.filter((_, i) => i % 2 === 0), [displayTechs]);
  const rightColumn = useMemo(() => displayTechs.filter((_, i) => i % 2 !== 0), [displayTechs]);

  const progress = clamp((newTotalTWh / predictedProduction) * 100, 0, 100);
  const isBalanced = nearlyEqual(newTotalTWh, predictedProduction);
  const hasChanges = useMemo(() => Object.values(addedByTech).some((v) => Math.abs(v) > EPS), [addedByTech]);

  const [progressAnimDone, setProgressAnimDone] = useState(false);
  useEffect(() => setProgressAnimDone(false), [progress]);
  const progressIsFull = progress >= 100 - EPS;

  // delayed balanced
  const [delayedBalanced, setDelayedBalanced] = useState(false);
  const balanceDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (balanceDelayRef.current) {
      clearTimeout(balanceDelayRef.current);
      balanceDelayRef.current = null;
    }
    if (isBalanced) {
      balanceDelayRef.current = setTimeout(() => setDelayedBalanced(true), 1000);
    } else {
      setDelayedBalanced(false);
    }
    return () => {
      if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    };
  }, [isBalanced]);

  // one-shot pulse when balanced becomes true
  useEffect(() => {
    if (!prevDelayedBalancedRef.current && delayedBalanced) {
      setAnalyzePulseKey((k) => k + 1);
    }
    prevDelayedBalancedRef.current = delayedBalanced;
  }, [delayedBalanced]);

  // close tech popup when clicking outside
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openTechId) {
        const openEl = techRefs.current[openTechId];
        if (openEl && !openEl.contains(target)) setOpenTechId(null);
      }
    };
    document.addEventListener("mousedown", handleGlobalMouseDown);
    return () => document.removeEventListener("mousedown", handleGlobalMouseDown);
  }, [openTechId]);

  useEffect(() => () => {
    if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
  }, []);

  // handlers
  const handleReset = useCallback(() => {
    setAddedByTech({});
    setOpenTechId(null);
  }, []);

  const handleCardClick = useCallback((techId: string) => {
    setOpenTechId(techId);
  }, []);

  const showTipNow = useCallback(() => {
    setShowAnalyzeTip(true);
    if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
    tipTimeoutRef.current = setTimeout(() => setShowAnalyzeTip(false), 3500);
  }, []);

  const handleAnalyzeClick = useCallback(() => {
    if (delayedBalanced) onSimulate?.();
    else showTipNow();
  }, [delayedBalanced, onSimulate, showTipNow]);

  const adjustTech = useCallback(
    (techId: string, dir: 1 | -1) => {
      setAddedByTech((prev) => {
        const currentDelta = prev[techId] || 0;
        const originalTWh = originalGenById[techId] || 0;
        const minDelta = -originalTWh;

        let appliedChange = 0;
        if (dir === 1) {
          const remainingToTarget = predictedProduction - (baseProduction + Object.values(prev).reduce((s, v) => s + v, 0));
          if (remainingToTarget <= EPS) return prev;
          appliedChange = Math.min(unitStepTWh, remainingToTarget);
        } else {
          const potentialNewDelta = currentDelta - unitStepTWh;
          appliedChange = potentialNewDelta < minDelta ? minDelta - currentDelta : -unitStepTWh;
        }

        if (Math.abs(appliedChange) <= EPS) return prev;
        return { ...prev, [techId]: currentDelta + appliedChange };
      });
    },
    [originalGenById, predictedProduction, baseProduction, unitStepTWh]
  );

  const density = useViewportDensity();
  const dens = <T,>(normal: T, compact: T, ultra: T) =>
    density === "ultra" ? ultra : density === "compact" ? compact : normal;

  return (
    <div className={`w-full h-full min-h-0 flex flex-col border border-emerald-200 bg-white rounded-2xl shadow-md ${dens(
      "p-4",
      "p-3",
      "p-2"
    )}`}>
      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className={`font-bold text-center text-emerald-800 mb-3 ${dens("text-xl", "text-lg", "text-base")}`}
      >
        Current Energy Mix
      </motion.h2>

      {/* Grid */}
      <div className={`grid grid-cols-2 ${dens("gap-3", "gap-2", "gap-1")} mb-2 overflow-visible`}>
        {[leftColumn, rightColumn].map((col, colIndex) => (
          <div key={colIndex} className={`flex flex-col ${dens("gap-3", "gap-2", "gap-1")}`}>
            {col.map((t) => {
              const isOpen = openTechId === t.id;
              const canIncrease = newTotalTWh < predictedProduction - EPS;
              const canDecrease = t.generationTWh > EPS;

              return (
                <TechCard
                  key={t.id}
                  tech={t as DisplayTech}
                  isOpen={isOpen}
                  onOpen={() => handleCardClick(t.id)}
                  onIncrease={() => adjustTech(t.id, 1)}
                  onDecrease={() => adjustTech(t.id, -1)}
                  canIncrease={canIncrease}
                  canDecrease={canDecrease}
                  forwardedRef={(el) => (techRefs.current[t.id] = el)}
                  colIndex={colIndex}
                  firstLoad={firstLoad}
                  density={density}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Info panel */}
      <div
        className={`border border-emerald-200 rounded-xl bg-emerald-50/30 flex items-center justify-center ${dens(
          "p-3 h-[85px]",
          "p-2 h-[72px]",
          "p-1 h-[60px]"
        )} mb-3`}
      >
        <AnimatePresence mode="wait">
          {openTechId ? (
            <InfoPanel
              openTechId={openTechId}
              techInfo={techInfo}
              allTechnologies={allTechnologies}
              density={density}
            />
          ) : (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={dens(
                "text-gray-400 italic text-[12px]",
                "text-gray-400 italic text-[11px]",
                "text-gray-400 italic text-[10px]"
              )}
            >
              Click an energy source to see details
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className={`relative flex items-center justify-center ${dens("mb-2", "mb-1.5", "mb-1")}`}>
        <AnalyzeButton
          delayedBalanced={delayedBalanced}
          onAnalyze={handleAnalyzeClick}
          onReset={handleReset}
          hasChanges={hasChanges}
          analyzePulseKey={analyzePulseKey}
          showAnalyzeTip={showAnalyzeTip}
          setShowAnalyzeTip={setShowAnalyzeTip}
          density={density}
        />
      </div>

      {/* Bottom section */}
      <div className="mt-auto">
        {/* Cards */}
        <div className={`flex items-center justify-center text-emerald-800 ${dens(
          "gap-4 mb-2",
          "gap-3 mb-1.5",
          "gap-2 mb-1"
        )}`}>
          <div
            className={`${dens(
              "px-3 py-2",
              "px-2.5 py-1.5",
              "px-2 py-1"
            )} rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm text-center`}
          >
            <div className={dens("text-[11px]", "text-[10px]", "text-[9px]")}>Current Production</div>
            <div className={dens("text-lg", "text-base", "text-sm") + " font-extrabold text-emerald-700"}>
              <AnimatedNumber value={newTotalTWh} format={formatEnergy} duration={1} />
            </div>
          </div>

          <span className={dens("text-xl", "text-lg", "text-base") + " text-emerald-600"} aria-hidden>
            →
          </span>

          <div
            className={`${dens(
              "px-3 py-2",
              "px-2.5 py-1.5",
              "px-2 py-1"
            )} rounded-lg bg-emerald-100 border border-emerald-200 shadow-sm text-center`}
          >
            <div className={dens("text-[11px]", "text-[10px]", "text-[9px]")}>Required in {TARGET_YEAR}</div>
            <div className={dens("text-lg", "text-base", "text-sm") + " font-extrabold text-emerald-700"}>
              <AnimatedNumber value={predictedProduction} format={formatEnergy} duration={1} />
            </div>
            <div className={dens("text-[10px]", "text-[9px]", "text-[8px]") + " text-emerald-900/70"}>2% annual growth</div>
          </div>
        </div>

        {/* Progress bar: bigger & closer to bottom in all densities */}
        <div
          className="relative sticky bottom-0 z-10 bg-white/80 backdrop-blur"
          style={{ paddingTop: "0.25rem", paddingBottom: "max(env(safe-area-inset-bottom), 0.25rem)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative"
          >
            <div className={`relative bg-gray-200 rounded-full overflow-hidden ${dens(
              "h-[26px]",
              "h-[22px]",
              "h-[20px]"
            )}`}>
              <motion.div
                className={`${progressIsFull && progressAnimDone ? "bg-emerald-600" : "bg-emerald-400"} h-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                onAnimationComplete={() => setProgressAnimDone(true)}
                aria-hidden
              />
              <div
                className="absolute inset-0 flex items-center justify-center font-semibold text-white drop-shadow"
                style={{ fontSize: dens(11, 10, 9) }}
              >
                <AnimatedNumber value={progress} format={(v) => `${v.toFixed(0)}%`} duration={1} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}