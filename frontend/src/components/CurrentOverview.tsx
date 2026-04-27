import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Country } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import InfoPanel from "./InfoPanel";
import AnalyzeButton from "./AnalyzeButton";
import TechCard from "./TechCard";
import AnalysisPopup, { AnalysisResult } from "./AnalysisPopup";
import { TECHNOLOGIES, TARGET_YEAR, EPS, TECH_INFO } from "../utils/constants";
import { formatEnergy } from "../utils/helpers";
import { useViewportDensity } from "../hooks/useViewportDensity";
import { useEnergySimulation } from "../hooks/useEnergySimulation";
import LoadingOverlay from "./LoadingOverlay";

const containerMotion = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const listItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: "easeOut" } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.18 } },
};

interface Props {
  country: Country;
  simulation: ReturnType<typeof useEnergySimulation>;
}

export default function CurrentOverview({ country, simulation }: Props) {
  const [openTechId, setOpenTechId] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [showAnalyzeTip, setShowAnalyzeTip] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzePulseKeyRef = useRef(0);
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevCountryIdRef = useRef(country.id);

  const density = useViewportDensity();
  const dens = <T,>(normal: T, compact: T, ultra: T) =>
    density === "ultra" ? ultra : density === "compact" ? compact : normal;

  const {
    predictedProduction,
    addedByTech,
    adjustTech,
    handleReset,
    newTotalTWh,
    progress,
    isBalanced,
    hasChanges,
    changes,
    originalGenById,
    shareMap,
    order,
    resetOrderFromCountry,
  } = simulation;

  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      handleReset();
      setOpenTechId(null);
      prevCountryIdRef.current = country.id;
      resetOrderFromCountry(country);
    }
  }, [country, handleReset, resetOrderFromCountry]);

  useEffect(() => setFirstLoad(false), []);

  const [progressAnimDone, setProgressAnimDone] = useState(false);
  useEffect(() => setProgressAnimDone(false), [progress]);

  const [delayedBalanced, setDelayedBalanced] = useState(false);
  const balanceDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    if (isBalanced) {
      balanceDelayRef.current = setTimeout(() => setDelayedBalanced(true), 1000);
    } else {
      setDelayedBalanced(false);
    }
    return () => {
      if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    };
  }, [isBalanced]);

  useEffect(() => {
    if (delayedBalanced) analyzePulseKeyRef.current += 1;
  }, [delayedBalanced]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!openTechId) return;
      const el = techRefs.current[openTechId];
      if (el && !el.contains(e.target as Node)) setOpenTechId(null);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [openTechId]);

  useEffect(() => {
    return () => {
      if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
      if (balanceDelayRef.current) clearTimeout(balanceDelayRef.current);
    };
  }, []);

  const handleCardClick = useCallback((techId: string) => setOpenTechId(techId), []);

  const displayTechs = useMemo(() => {
    const newTotal = newTotalTWh;
    return order.map((id, i) => {
      const base = TECHNOLOGIES.find((t) => t.id === id)!;
      const originalShare = shareMap[id] || 0;
      const originalTWh = originalGenById[id] || 0;
      const delta = addedByTech[id] || 0;
      const newTWh = Math.max(0, originalTWh + delta);
      const newShare = newTotal > 0 ? newTWh / newTotal : 0;

      const shareColor =
        newShare > originalShare
          ? "text-emerald-700"
          : newShare < originalShare
            ? "text-red-600"
            : "text-stone-700";

      const genColor =
        newTWh > originalTWh
          ? "text-emerald-700"
          : newTWh < originalTWh
            ? "text-red-600"
            : "text-stone-700";

      const trend: "up" | "down" | "none" =
        newTWh > originalTWh + EPS
          ? "up"
          : newTWh < originalTWh - EPS
            ? "down"
            : "none";

      return {
        ...base,
        share: newShare,
        shareColor,
        generationTWh: newTWh,
        genColor,
        revealIndex: i,
        trend,
      } as const;
    });
  }, [order, shareMap, originalGenById, addedByTech, newTotalTWh]);

  const leftColumn = useMemo(
    () => displayTechs.filter((_, i) => i % 2 === 0),
    [displayTechs]
  );
  const rightColumn = useMemo(
    () => displayTechs.filter((_, i) => i % 2 === 1),
    [displayTechs]
  );

  const progressIsFull = progress >= 100 - EPS;

  return (
    <>
      <motion.div
        variants={containerMotion as any}
        initial="hidden"
        animate="visible"
        className={`panel-shell flex h-full min-h-0 w-full flex-col overflow-hidden ${dens(
          "p-3",
          "p-3",
          "p-2"
        )}`}
      >
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.02 }}
          className={`section-title mb-2 ${dens(
            "text-xl",
            "text-lg",
            "text-base"
          )}`}
        >
          Energy Mix in {country.name}
        </motion.h2>

        <motion.div
          className={`mb-2 grid grid-cols-2 overflow-visible ${dens(
            "gap-3",
            "gap-2",
            "gap-1"
          )}`}
          variants={listContainer as any}
          initial="hidden"
          animate="visible"
        >
          {[leftColumn, rightColumn].map((col, colIndex) => (
            <motion.div
              key={colIndex}
              className={`flex flex-col ${dens("gap-3", "gap-2", "gap-1")}`}
            >
              {col.map((t) => {
                const isOpen = openTechId === t.id;
                const canIncrease = newTotalTWh < predictedProduction - EPS;
                const canDecrease = t.generationTWh > EPS;
                return (
                  <motion.div key={t.id} variants={listItem as any} exit="exit">
                    <TechCard
                      tech={t as any}
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

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.06 }}
          className={`section-copy mb-3 font-medium ${dens(
            "text-[14px]",
            "text-[11px]",
            "text-[11px]"
          )}`}
        >
          Match the required demand for {TARGET_YEAR} by increasing or decreasing the energy production of each source.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.04 }}
          className={`subtle-frame mb-3 flex items-center justify-center ${dens(
            "h-[85px] p-3",
            "h-[72px] p-2",
            "h-[60px] p-1"
          )}`}
        >
          <AnimatePresence mode="wait">
            {openTechId ? (
              <motion.div
                key={openTechId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.22 }}
                style={{ width: "100%" }}
              >
                <InfoPanel
                  openTechId={openTechId}
                  techInfo={TECH_INFO}
                  allTechnologies={
                    TECHNOLOGIES as { id: string; name: string }[]
                  }
                  density={density}
                />
              </motion.div>
            ) : (
              <motion.span
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={dens(
                  "text-[#6d8378] italic text-[12px]",
                  "text-[#6d8378] italic text-[11px]",
                  "text-[#6d8378] italic text-[10px]"
                )}
              >
                Click an energy source to see details
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            className="sticky bottom-0 z-30 border-t border-white/50 bg-[linear-gradient(180deg,rgba(250,247,239,0),rgba(250,247,239,0.92)_18%,rgba(250,247,239,0.98))] px-4 py-3 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.02 }}
              className="mb-3 flex items-center justify-center"
            >
              <div className="w-full max-w-md">
                <AnalyzeButton
                  delayedBalanced={delayedBalanced}
                  onReset={() => {
                    handleReset();
                    setOpenTechId(null);
                  }}
                  hasChanges={hasChanges}
                  analyzePulseKey={analyzePulseKeyRef.current}
                  showAnalyzeTip={showAnalyzeTip}
                  setShowAnalyzeTip={setShowAnalyzeTip}
                  density={density}
                  selectedCountryId={country.id}
                  changes={changes}
                  setAnalysisResult={setAnalysisResult}
                  setLoading={setLoading}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 }}
            >
              <div
                className={`flex items-center justify-center text-[#173228] ${dens(
                  "mb-2 gap-4",
                  "mb-1.5 gap-3",
                  "mb-1 gap-2"
                )}`}
              >
                <div
                  className={`soft-stat-card ${dens(
                    "px-3 py-2",
                    "px-2.5 py-1.5",
                    "px-2 py-1"
                  )}`}
                >
                  <div className={`${dens("text-[11px]", "text-[10px]", "text-[9px]")} uppercase tracking-[0.18em] text-[#6b8176]`}>
                    Current Production
                  </div>
                  <div
                    className={
                      dens("text-lg", "text-base", "text-sm") +
                      " mt-1 font-extrabold text-[#244c3d]"
                    }
                  >
                    <AnimatedNumber
                      value={newTotalTWh}
                      format={formatEnergy}
                      duration={1}
                    />
                  </div>
                </div>

                <span
                  className={
                    dens("text-[10px]", "text-[9px]", "text-[8px]") +
                    " rounded-full border border-white/70 bg-white/55 px-2 py-1 font-semibold uppercase tracking-[0.24em] text-[#6a8075]"
                  }
                >
                  Goal
                </span>

                <div
                  className={`soft-stat-card ${dens(
                    "px-3 py-2",
                    "px-2.5 py-1.5",
                    "px-2 py-1"
                  )}`}
                >
                  <div className={`${dens("text-[11px]", "text-[10px]", "text-[9px]")} uppercase tracking-[0.18em] text-[#6b8176]`}>
                    Required in {TARGET_YEAR}
                  </div>
                  <div
                    className={
                      dens("text-lg", "text-base", "text-sm") +
                      " mt-1 font-extrabold text-[#244c3d]"
                    }
                  >
                    <AnimatedNumber
                      value={predictedProduction}
                      format={formatEnergy}
                      duration={1}
                    />
                  </div>
                  <div
                    className={
                      dens("text-[10px]", "text-[9px]", "text-[8px]") +
                      " text-[#5f766b]"
                    }
                  >
                    1% annual growth
                  </div>
                </div>
              </div>

              <div className="relative" style={{ paddingTop: "0.25rem" }}>
                <div
                  className={`relative overflow-hidden rounded-full border border-white/70 bg-[#d8e3d7] p-[3px] shadow-inner ${dens(
                    "h-[26px]",
                    "h-[22px]",
                    "h-[20px]"
                  )}`}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  aria-label="Progress to required production"
                >
                  <motion.div
                    className={`${progressIsFull && progressAnimDone
                      ? "bg-[linear-gradient(90deg,#244c3d_0%,#3f8c69_100%)]"
                      : "bg-[linear-gradient(90deg,#417c66_0%,#67a784_100%)]"
                      } h-full rounded-full`}
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
                    <AnimatedNumber
                      value={progress}
                      format={(v) => `${v.toFixed(0)}%`}
                      duration={1}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {analysisResult && (
        <AnalysisPopup
          result={analysisResult}
          onClose={() => setAnalysisResult(null)}
        />
      )}

      <LoadingOverlay visible={loading} message="Analyzing scenario..." />
    </>
  );
}
