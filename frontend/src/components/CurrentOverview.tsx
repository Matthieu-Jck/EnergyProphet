import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Country } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import InfoPanel from "./InfoPanel";
import AnalyzeButton from "./AnalyzeButton";
import TechCard, { DisplayTech } from "./TechCard";
import { EPS, TARGET_YEAR, TECHNOLOGIES, ANNUAL_GROWTH_RATE as ANNUAL_RATE } from "../utils/constants";
import { nearlyEqual, formatEnergy, clamp } from "../utils/helpers";
import { useViewportDensity } from "../hooks/useViewportDensity";

interface Props {
  country: Country;
  onSimulate?: () => void;
}

const TECH_INFO: Record<string, { green: boolean; controllable: boolean; co2: number; cost: number }> = {
  hydro: { green: true, controllable: true, co2: 5, cost: 40 },
  nuclear: { green: true, controllable: true, co2: 12, cost: 60 },
  solar: { green: true, controllable: false, co2: 20, cost: 50 },
  wind: { green: true, controllable: false, co2: 15, cost: 45 },
  biomass: { green: true, controllable: true, co2: 100, cost: 55 },
  coal: { green: false, controllable: true, co2: 820, cost: 70 },
  oil: { green: false, controllable: true, co2: 650, cost: 75 },
  gas: { green: false, controllable: true, co2: 450, cost: 55 },
};

// small motion variants used across the component for consistency
const containerMotion = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };
const listContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const listItem = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: "easeOut" } }, exit: { opacity: 0, y: 6, transition: { duration: 0.18 } } };

export default function CurrentOverview({ country, onSimulate }: Props) {
  const [openTechId, setOpenTechId] = useState<string | null>(null);
  const [addedByTech, setAddedByTech] = useState<Record<string, number>>({});
  const [firstLoad, setFirstLoad] = useState(true);
  const [showAnalyzeTip, setShowAnalyzeTip] = useState(false);
  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [analyzePulseKey, setAnalyzePulseKey] = useState(0);
  const prevDelayedBalancedRef = useRef(false);
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevCountryIdRef = useRef(country.id);

  // stable order (reset when country changes)
  const [order, setOrder] = useState<string[]>(() => TECHNOLOGIES.map((t) => t.id));

  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      setAddedByTech({});
      setOpenTechId(null);
      prevCountryIdRef.current = country.id;
      setOrder(
        [...TECHNOLOGIES]
          .sort((a, b) => {
            const sA = country.technologies.find((t) => t.id === a.id)?.share ?? 0;
            const sB = country.technologies.find((t) => t.id === b.id)?.share ?? 0;
            return sB - sA;
          })
          .map((t) => t.id)
      );
    }
  }, [country]);

  useEffect(() => setFirstLoad(false), []);

  const baseProduction = country.totalGenerationTWh;
  const years = TARGET_YEAR - 2025;
  const predictedProduction = useMemo(() => baseProduction * Math.pow(1 + ANNUAL_RATE, years), [baseProduction, years]);

  const shareMap = useMemo(() => Object.fromEntries(country.technologies.map((t) => [t.id, t.share])), [country.technologies]);

  const originalGenById = useMemo(
    () => Object.fromEntries(TECHNOLOGIES.map((t) => [t.id, (shareMap[t.id] || 0) * baseProduction])),
    [baseProduction, shareMap]
  );

  const unitStepTWh = (predictedProduction - baseProduction) / 5;

  const totalDelta = useMemo(() => Object.values(addedByTech).reduce((s, v) => s + v, 0), [addedByTech]);
  const newTotalTWh = baseProduction + totalDelta;

  const displayTechs: DisplayTech[] = useMemo(
    () =>
      order.map((id, i) => {
        const base = TECHNOLOGIES.find((t) => t.id === id)!;
        const originalShare = shareMap[id] || 0;
        const originalTWh = originalGenById[id] || 0;
        const delta = addedByTech[id] || 0;
        const newTWh = Math.max(0, originalTWh + delta);
        const newShare = newTotalTWh > 0 ? newTWh / newTotalTWh : 0;
        const shareColor = newShare > originalShare ? "text-emerald-700" : newShare < originalShare ? "text-red-600" : "text-gray-800";
        const genColor = newTWh > originalTWh ? "text-emerald-700" : newTWh < originalTWh ? "text-red-600" : "text-gray-800";
        const trend: "up" | "down" | "none" = newShare > originalShare + EPS ? "up" : newShare < originalShare - EPS ? "down" : "none";

        return { ...base, share: newShare, shareColor, generationTWh: newTWh, genColor, revealIndex: i, trend } as const;
      }),
    [order, shareMap, originalGenById, addedByTech, newTotalTWh]
  );

  const leftColumn = useMemo(() => displayTechs.filter((_, i) => i % 2 === 0), [displayTechs]);
  const rightColumn = useMemo(() => displayTechs.filter((_, i) => i % 2 === 1), [displayTechs]);

  const progress = clamp((newTotalTWh / predictedProduction) * 100, 0, 100);
  const isBalanced = nearlyEqual(newTotalTWh, predictedProduction);
  const hasChanges = useMemo(() => Object.values(addedByTech).some((v) => Math.abs(v) > EPS), [addedByTech]);

  const [progressAnimDone, setProgressAnimDone] = useState(false);
  useEffect(() => setProgressAnimDone(false), [progress]);

  // delayed balanced indicator
  const [delayedBalanced, setDelayedBalanced] = useState(false);
  const balanceDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    if (isBalanced) balanceDelayRef.current = setTimeout(() => setDelayedBalanced(true), 1000);
    else setDelayedBalanced(false);
    return () => {
      if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    };
  }, [isBalanced]);

  // pulse when balanced toggles on
  useEffect(() => {
    if (!prevDelayedBalancedRef.current && delayedBalanced) setAnalyzePulseKey((k) => k + 1);
    prevDelayedBalancedRef.current = delayedBalanced;
  }, [delayedBalanced]);

  // close popup when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openTechId) return;
      const el = techRefs.current[openTechId];
      if (el && !el.contains(e.target as Node)) setOpenTechId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openTechId]);

  useEffect(() => {
    return () => {
      if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
      if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    };
  }, []);

  const handleReset = useCallback(() => {
    setAddedByTech({});
    setOpenTechId(null);
  }, []);

  const handleCardClick = useCallback((techId: string) => setOpenTechId(techId), []);

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
        const current = prev[techId] || 0;
        const original = originalGenById[techId] || 0;
        const minDelta = -original;

        if (dir === 1) {
          const remaining = predictedProduction - (baseProduction + Object.values(prev).reduce((s, v) => s + v, 0));
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
    [baseProduction, predictedProduction, unitStepTWh, originalGenById]
  );

  const density = useViewportDensity();
  const dens = <T,>(normal: T, compact: T, ultra: T) => (density === "ultra" ? ultra : density === "compact" ? compact : normal);
  const progressIsFull = progress >= 100 - EPS;

  return (
    <motion.div variants={containerMotion as any} initial="hidden" animate="visible" className={`w-full h-full min-h-0 flex flex-col border border-emerald-200 bg-white rounded-2xl shadow-md ${dens("p-3", "p-3", "p-2")}`}>

      <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay: 0.02 }} className={`font-bold text-center text-emerald-800 mb-2 ${dens("text-xl", "text-lg", "text-base")}`}>
        Current Energy Mix
      </motion.h2>

      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.06 }} className={`text-center text-emerald-700/90 mb-3 ${dens("text-[14px]", "text-[11px]", "text-[11px]")}`}>
        Toggle each energy source to to match the required demand for {TARGET_YEAR}.
      </motion.p>

      <motion.div className={`grid grid-cols-2 ${dens("gap-3", "gap-2", "gap-1")} mb-2 overflow-visible`} variants={listContainer as any} initial="hidden" animate="visible">
        {[leftColumn, rightColumn].map((col, colIndex) => (
          <motion.div key={colIndex} className={`flex flex-col ${dens("gap-3", "gap-2", "gap-1")}`}>
            {col.map((t) => {
              const isOpen = openTechId === t.id;
              const canIncrease = newTotalTWh < predictedProduction - EPS;
              const canDecrease = t.generationTWh > EPS;
              return (
                <motion.div key={t.id} variants={listItem as any} exit="exit">
                  <TechCard
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
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.04 }} className={`border border-emerald-200 rounded-xl bg-emerald-50/30 flex items-center justify-center ${dens("p-3 h-[85px]", "p-2 h-[72px]", "p-1 h-[60px]")} mb-3`}>
        <AnimatePresence mode="wait">
          {openTechId ? (
            <motion.div key={openTechId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.22 }} style={{ width: "100%" }}>
              <InfoPanel openTechId={openTechId} techInfo={TECH_INFO} allTechnologies={TECHNOLOGIES as { id: string; name: string }[]} density={density} />
            </motion.div>
          ) : (
            <motion.span key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className={dens("text-gray-400 italic text-[12px]", "text-gray-400 italic text-[11px]", "text-gray-400 italic text-[10px]")}>
              Click an energy source to see details
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sticky footer block: contains the Analyze controls AND the progress bar together so they cannot overlap */}
      <div className="mt-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="sticky bottom-0 z-30 bg-white/90 backdrop-blur px-4 py-3 border-t border-emerald-50">

          {/* analyze controls centered with comfortable spacing */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.02 }} className="flex items-center justify-center mb-3">
            <div className="w-full max-w-md">
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
          </motion.div>

          {/* production cards and progress bar stacked below the controls */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }}>
            <div className={`flex items-center justify-center text-emerald-800 ${dens("gap-4 mb-2", "gap-3 mb-1.5", "gap-2 mb-1")}`}>
              <div className={`${dens("px-3 py-2", "px-2.5 py-1.5", "px-2 py-1")} rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm text-center`}>
                <div className={dens("text-[11px]", "text-[10px]", "text-[9px]")}>Current Production</div>
                <div className={dens("text-lg", "text-base", "text-sm") + " font-extrabold text-emerald-700"}>
                  <AnimatedNumber value={newTotalTWh} format={formatEnergy} duration={1} />
                </div>
              </div>

              <span className={dens("text-xl", "text-lg", "text-base") + " text-emerald-600"} aria-hidden>
                →
              </span>

              <div className={`${dens("px-3 py-2", "px-2.5 py-1.5", "px-2 py-1")} rounded-lg bg-emerald-100 border border-emerald-200 shadow-sm text-center`}>
                <div className={dens("text-[11px]", "text-[10px]", "text-[9px]")}>Required in {TARGET_YEAR}</div>
                <div className={dens("text-lg", "text-base", "text-sm") + " font-extrabold text-emerald-700"}>
                  <AnimatedNumber value={predictedProduction} format={formatEnergy} duration={1} />
                </div>
                <div className={dens("text-[10px]", "text-[9px]", "text-[8px]") + " text-emerald-900/70"}>2% annual growth</div>
              </div>
            </div>

            <div className="relative" style={{ paddingTop: "0.25rem" }}>
              <div className={`relative bg-gray-200 rounded-full overflow-hidden ${dens("h-[26px]", "h-[22px]", "h-[20px]")}`}>
                <motion.div
                  className={`${progressIsFull && progressAnimDone ? "bg-emerald-600" : "bg-emerald-400"} h-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  onAnimationComplete={() => setProgressAnimDone(true)}
                  aria-hidden
                />
                <div className="absolute inset-0 flex items-center justify-center font-semibold text-white drop-shadow" style={{ fontSize: dens(11, 10, 9) }}>
                  <AnimatedNumber value={progress} format={(v) => `${v.toFixed(0)}%`} duration={1} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
