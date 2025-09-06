import { Country } from "../types";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";

interface Props {
  country: Country;
  onSimulate?: () => void;
}

function AnimatedNumber({
  value,
  format = (v: number) => v.toFixed(0),
  duration = 1,
}: {
  value: number;
  format?: (v: number) => string;
  duration?: number;
}) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    return controls.stop;
  }, [value, duration, mv]);

  return <>{format(display)}</>;
}

export default function CurrentOverview({ country, onSimulate }: Props) {
  const [addedByTech, setAddedByTech] = useState<Record<string, number>>({});
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openTechId, setOpenTechId] = useState<string | null>(null);

  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => setFirstLoad(false), []);

  const prevCountryIdRef = useRef<string>(country.id);

  // Analyze helper tip state
  const [showAnalyzeTip, setShowAnalyzeTip] = useState(false);
  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One-shot pulse key, triggered when delayedBalanced flips false -> true
  const [analyzePulseKey, setAnalyzePulseKey] = useState(0);
  const prevDelayedBalancedRef = useRef(false);

  const allTechnologies = [
    { id: "hydro", name: "Hydro" },
    { id: "nuclear", name: "Nuclear" },
    { id: "solar", name: "Solar" },
    { id: "wind", name: "Wind" },
    { id: "biomass", name: "Biomass" },
    { id: "coal", name: "Coal" },
    { id: "oil", name: "Oil" },
    { id: "gas", name: "Gas" },
  ];

  const techInfo: Record<
    string,
    { green: boolean; controllable: boolean; co2: number; cost: number }
  > = {
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
  const years = 2050 - 2025;
  const annualGrowthRate = 0.02;
  const predictedProduction = baseProduction * Math.pow(1 + annualGrowthRate, years);
  const goalDelta = predictedProduction - baseProduction;
  const unitStepTWh = goalDelta / 5;

  const shareMap: Record<string, number> = useMemo(
    () => Object.fromEntries(country.technologies.map((t) => [t.id, t.share])),
    [country.technologies]
  );

  const originalGenById: Record<string, number> = useMemo(
    () => Object.fromEntries(allTechnologies.map((t) => [t.id, (shareMap[t.id] || 0) * baseProduction])),
    [allTechnologies, shareMap, baseProduction]
  );

  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      setAddedByTech({});
      setOpenTechId(null);
      prevCountryIdRef.current = country.id;
      stableOrderRef.current = [...allTechnologies]
        .sort((a, b) => (shareMap[b.id] || 0) - (shareMap[a.id] || 0))
        .map((t) => t.id);
    }
  }, [country.id]);

  const totalDelta = Object.values(addedByTech).reduce((s, v) => s + v, 0);
  const newTotalTWh = baseProduction + totalDelta;

  const displayTechs = stableOrderRef.current.map((id) => {
    const base = allTechnologies.find((t) => t.id === id)!;
    const originalShare = shareMap[base.id] || 0;
    const originalTWh = originalGenById[base.id] || 0;
    const delta = addedByTech[base.id] || 0;
    const newTWh = Math.max(0, originalTWh + delta);
    const newShare = newTotalTWh > 0 ? newTWh / newTotalTWh : 0;

    const shareColor =
      newShare > originalShare ? "text-emerald-700" : newShare < originalShare ? "text-red-600" : "text-gray-800";
    const genColor =
      newTWh > originalTWh ? "text-emerald-700" : newTWh < originalTWh ? "text-red-600" : "text-gray-800";

    return { ...base, share: newShare, shareColor, generationTWh: newTWh, genColor };
  });

  const leftColumn = displayTechs.filter((_, i) => i % 2 === 0);
  const rightColumn = displayTechs.filter((_, i) => i % 2 !== 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.15 + i * 0.04 },
    }),
  };

  const formatEnergy = (twh: number) => `${Math.round(twh)} TWh`;
  const progress = Math.min((newTotalTWh / predictedProduction) * 100, 100);
  const EPS = 1e-6;
  const isBalanced = Math.abs(newTotalTWh - predictedProduction) < EPS;
  const hasChanges = Object.values(addedByTech).some((v) => Math.abs(v) > EPS);

  // Progress bar color switching should only happen once its fill animation completes
  const [progressAnimDone, setProgressAnimDone] = useState(false);
  useEffect(() => {
    // reset on each progress change so we wait for the next animation end
    setProgressAnimDone(false);
  }, [progress]);
  const progressIsFull = progress >= 100 - EPS;

  // Delay the "balanced" UI by 1s so it lines up with progress animation/percentage
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

  // Trigger the one-time pulse each time delayedBalanced turns true
  useEffect(() => {
    if (!prevDelayedBalancedRef.current && delayedBalanced) {
      setAnalyzePulseKey((k) => k + 1);
    }
    prevDelayedBalancedRef.current = delayedBalanced;
  }, [delayedBalanced]);

  // Close tech popup when clicking outside the open card
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openTechId) {
        const openEl = techRefs.current[openTechId];
        if (openEl && !openEl.contains(target)) {
          setOpenTechId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleGlobalMouseDown);
    return () => document.removeEventListener("mousedown", handleGlobalMouseDown);
  }, [openTechId]);

  useEffect(() => () => {
    if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
  }, []);

  const handleReset = () => {
    setAddedByTech({});
    setOpenTechId(null);
  };

  // Always (re)select the clicked tech; keep highlight & popup visible
  const handleCardClick = (techId: string) => {
    setOpenTechId(techId);
  };

  const adjustTech = (techId: string, dir: 1 | -1) => {
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
        if (potentialNewDelta < minDelta) {
          appliedChange = minDelta - currentDelta;
        } else {
          appliedChange = -unitStepTWh;
        }
      }

      if (Math.abs(appliedChange) <= EPS) return prev;
      return { ...prev, [techId]: currentDelta + appliedChange };
    });
  };

  const showTipNow = () => {
    setShowAnalyzeTip(true);
    if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
    tipTimeoutRef.current = setTimeout(() => setShowAnalyzeTip(false), 3200);
  };

  const handleAnalyzeClick = () => {
    if (delayedBalanced) {
      onSimulate?.();
    } else {
      showTipNow();
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col border border-emerald-200 bg-white rounded-2xl shadow-md p-4">
      {/* Header (menu button removed) */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="text-xl font-bold mb-4 text-center text-emerald-800"
      >
        Current Energy Mix
      </motion.h2>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mb-2 overflow-visible">
        {[leftColumn, rightColumn].map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3">
            {col.map((t, index) => {
              const isOpen = openTechId === t.id;
              const sideClass = colIndex === 0 ? "left-full ml-2" : "right-full mr-2";

              const canIncrease = newTotalTWh < predictedProduction - EPS;
              const canDecrease = t.generationTWh > EPS;

              return (
                <motion.div
                  key={t.id}
                  custom={index}
                  variants={cardVariants}
                  initial={firstLoad ? "hidden" : false}
                  animate={firstLoad ? "visible" : false}
                  ref={(el) => {
                    techRefs.current[t.id] = el;
                  }}
                  onClick={() => handleCardClick(t.id)}
                  className={`relative grid grid-cols-2 gap-2 border rounded-lg p-2 ${isOpen ? "bg-gray-100" : "bg-white"} hover:bg-gray-100 hover:shadow-sm transition-all duration-200 min-h-[56px] cursor-pointer`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <img src={`/icons/${t.id}.png`} alt={`${t.name} icon`} className="w-7 h-7 mb-1" />
                    <span className="text-xs font-medium text-center text-gray-800">{t.name}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-emerald-100 pl-1">
                    <span className={`font-semibold text-base text-center transition-colors duration-300 ${t.shareColor}`}>
                      <AnimatedNumber value={t.share * 100} format={(v) => `${v.toFixed(0)}%`} duration={1} />
                    </span>
                    <span className={`text-xs text-center transition-colors duration-300 ${t.genColor}`}>
                      <AnimatedNumber value={t.generationTWh} format={formatEnergy} duration={1} />
                    </span>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="controls"
                        initial={{ opacity: 0, scale: 0.9, y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: "-50%" }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-1/2 ${sideClass} z-[9999]`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative flex flex-col items-center bg-white border border-emerald-200 rounded-xl shadow-lg p-2 gap-2">
                          <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${colIndex === 0 ? "-left-2" : "-right-2"}`}>
                            <div
                              className={`w-0 h-0 ${
                                colIndex === 0
                                  ? "border-y-[8px] border-y-transparent border-r-[8px] border-r-emerald-500"
                                  : "border-y-[8px] border-y-transparent border-l-[8px] border-l-emerald-500"
                              }`}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => adjustTech(t.id, 1)}
                            disabled={!canIncrease}
                            className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${!canIncrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                            title="Increase by 20% of target gap"
                          >
                            <img src="/icons/plus.png" alt="Increase" className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => adjustTech(t.id, -1)}
                            disabled={!canDecrease}
                            className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${!canDecrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                            title="Decrease by 20% of target gap"
                          >
                            <img src="/icons/minus.png" alt="Decrease" className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ✅ Energy info panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="border border-emerald-200 rounded-xl p-3 mb-3 h-[85px] flex items-center justify-center bg-emerald-50/30"
      >
        <AnimatePresence mode="wait">
          {openTechId ? (
            (() => {
              const info = techInfo[openTechId];
              const tech = allTechnologies.find((t) => t.id === openTechId)!;
              const co2 = info.co2;
              const co2Color =
                co2 < 50
                  ? "bg-emerald-200 text-emerald-900"
                  : co2 < 200
                  ? "bg-yellow-200 text-yellow-900"
                  : co2 < 500
                  ? "bg-orange-200 text-orange-900"
                  : "bg-amber-800 text-white";

              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-6 w-full max-w-md"
                >
                  {/* Left: icon + name */}
                  <div className="flex flex-col items-center justify-center w-20">
                    <img src={`/icons/${tech.id}.png`} alt={tech.name} className="w-10 h-10 mb-1" />
                    <span className="text-[11px] font-medium text-gray-800">{tech.name}</span>
                  </div>

                  {/* Right: CO₂ + Price */}
                  <div className="flex flex-1 justify-around gap-3">
                    {/* CO₂ */}
                    <div className={`flex flex-col items-center justify-center rounded-lg shadow-sm ${co2Color} w-16 h-16`}>
                      <span className="text-[10px] font-medium">CO₂</span>
                      <span className="text-xs font-bold">{info.co2} g</span>
                      <span className="text-[9px]">/TWh</span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-center justify-center rounded-lg shadow-sm bg-gray-200 text-gray-900 w-16 h-16">
                      <span className="text-[10px] font-medium">Price</span>
                      <span className="text-xs font-bold">€{info.cost}</span>
                      <span className="text-[9px]">/TWh</span>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          ) : (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-gray-400 italic"
            >
              Click an energy source to see details
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="relative flex items-center justify-center mb-2"
      >
        <motion.button
          key={analyzePulseKey}
          whileHover={delayedBalanced ? { y: -1 } : undefined}
          whileTap={delayedBalanced ? { scale: 0.98 } : undefined}
          animate={delayedBalanced ? { scale: [1, 1.06, 1] } : {}}
          transition={delayedBalanced ? { duration: 0.35, ease: "easeInOut" } : {}}
          onClick={handleAnalyzeClick}
          aria-disabled={!delayedBalanced}
          title={!delayedBalanced ? "Finish your prediction to analyze" : undefined}
          className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-colors transform-gpu ${
            delayedBalanced
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
              : "bg-emerald-600/40 text-white/80 cursor-not-allowed shadow"
          }`}
        >
          Analyze
        </motion.button>

        {/* Reset icon button — square, right-aligned */}
        <motion.button
          whileHover={hasChanges ? { rotate: 8 } : {}}
          whileTap={hasChanges ? { scale: 0.95, rotate: -8 } : {}}
          onClick={handleReset}
          aria-label="Reset adjustments"
          title={hasChanges ? "Reset" : "Nothing to reset"}
          className={`absolute right-0 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-transparent bg-white/60 transition ${
            hasChanges ? "opacity-80 hover:shadow-md hover:bg-white shadow-lg" : "opacity-10 pointer-events-none shadow"
          }`}
        >
          <img src="/icons/reset.png" alt="" className="w-6 h-6" />
        </motion.button>

        {/* Disabled analyze tip popup */}
        <AnimatePresence>
          {showAnalyzeTip && (
            <motion.div
              key="analyze-tip"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 max-w-xl w-[92%] bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 text-center"
              role="alert"
            >
              <div className="text-sm text-emerald-900">
                Reach the required 2050 production by adjusting the energy mix, then click <span className="font-semibold">Analyze</span> to review your choices.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom section */}
      <div className="mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="flex items-center justify-center gap-4 text-emerald-800 mb-2"
        >
          <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm text-center">
            <div className="text-[11px] font-medium">Current Production</div>
            <div className="text-lg font-extrabold text-emerald-700">
              <AnimatedNumber value={newTotalTWh} format={formatEnergy} duration={1} />
            </div>
          </div>

          <span className="text-xl text-emerald-600" aria-hidden>
            →
          </span>

          <div className="px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-200 shadow-sm text-center">
            <div className="text-[11px] font-medium">Required in 2050</div>
            <div className="text-lg font-extrabold text-emerald-700">
              <AnimatedNumber value={predictedProduction} format={formatEnergy} duration={1} />
            </div>
            <div className="text-[10px] text-emerald-900/70">2% annual growth</div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="relative bg-gray-200 rounded-full h-[22px] overflow-hidden"
          aria-label="Progress toward required 2050 production"
        >
          <motion.div
            className={`${progressIsFull && progressAnimDone ? "bg-emerald-600" : "bg-emerald-400"} h-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            onAnimationComplete={() => setProgressAnimDone(true)}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white drop-shadow">
            <AnimatedNumber value={progress} format={(v) => `${v.toFixed(0)}%`} duration={1} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}