import { Country } from "../types";
import { motion, useMotionValue, animate } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface Props {
  country: Country;
  onSimulate?: () => void;
}

/** Animated number (smooth interpolation) */
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
  }, [value, duration]);

  return <>{format(display)}</>;
}

export default function CurrentOverview({ country, onSimulate }: Props) {
  const [addedByTech, setAddedByTech] = useState<Record<string, number>>({});
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openTechId, setOpenTechId] = useState<string | null>(null);

  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => setFirstLoad(false), []);

  const prevCountryIdRef = useRef<string>(country.id);
  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      setAddedByTech({});
      setOpenTechId(null);
      prevCountryIdRef.current = country.id;
    }
  }, [country.id]);

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

  const baseProduction = country.totalGenerationTWh;
  const years = 2050 - 2025;
  const annualGrowthRate = 0.02;
  const predictedProduction = baseProduction * Math.pow(1 + annualGrowthRate, years);
  const goalDelta = predictedProduction - baseProduction;
  const unitStepTWh = goalDelta / 5;

  const shareMap: Record<string, number> = Object.fromEntries(
    country.technologies.map((t) => [t.id, t.share])
  );
  const originalGenById: Record<string, number> = Object.fromEntries(
    allTechnologies.map((t) => [t.id, (shareMap[t.id] || 0) * baseProduction])
  );

  const totalDelta = Object.values(addedByTech).reduce((s, v) => s + v, 0);
  const newTotalTWh = baseProduction + totalDelta;

  const displayTechs = allTechnologies
    .map((base) => {
      const originalShare = shareMap[base.id] || 0;
      const originalTWh = originalGenById[base.id] || 0;
      const delta = addedByTech[base.id] || 0;
      const newTWh = Math.max(0, originalTWh + delta);
      const newShare = newTotalTWh > 0 ? newTWh / newTotalTWh : 0;

      const shareColor =
        newShare > originalShare ? "text-green-600" : newShare < originalShare ? "text-red-600" : "text-black";
      const genColor =
        newTWh > originalTWh ? "text-green-600" : newTWh < originalTWh ? "text-red-600" : "text-black";

      return { ...base, share: newShare, shareColor, generationTWh: newTWh, genColor };
    })
    .sort((a, b) => b.share - a.share);

  const leftColumn = displayTechs.filter((_, i) => i % 2 === 0);
  const rightColumn = displayTechs.filter((_, i) => i % 2 !== 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.2 + i * 0.04 } }),
  };

  const formatEnergy = (twh: number) => `${Math.round(twh)} TWh`;
  const progress = Math.min((newTotalTWh / predictedProduction) * 100, 100);
  const EPS = 1e-6;
  const isBalanced = Math.abs(newTotalTWh - predictedProduction) < EPS;

  const handleReset = () => {
    setAddedByTech({});
    setOpenTechId(null);
  };

  const handleCardClick = (techId: string) => {
    setOpenTechId((prev) => (prev === techId ? null : techId));
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

  return (
    <div className="h-full flex flex-col border border-emerald-200 p-4 rounded-lg bg-white shadow-md max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="text-xl font-bold mb-4 text-center text-emerald-800"
      >
        Current Energy Mix
      </motion.h2>

      <div className="grid grid-cols-2 gap-3 mb-6 overflow-hidden">
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
                  className="relative grid grid-cols-2 gap-2 border rounded-md p-2 bg-gray-50 hover:shadow transition-shadow duration-200 min-h-[56px] cursor-pointer"
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

                  {isOpen && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${sideClass} z-20`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-center bg-white border border-emerald-200 rounded-xl shadow-lg p-2 gap-2">
                        <button
                          type="button"
                          onClick={() => adjustTech(t.id, 1)}
                          disabled={!canIncrease}
                          className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${
                            !canIncrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                          }`}
                          title="Increase by 20% of target gap"
                        >
                          <img src="/public/icons/plus.png" alt="Increase" className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => adjustTech(t.id, -1)}
                          disabled={!canDecrease}
                          className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${
                            !canDecrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                          }`}
                          title="Decrease by 20% of target gap"
                        >
                          <img src="/public/icons/minus.png" alt="Decrease" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {isBalanced && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => onSimulate?.()}
            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 transition-colors"
          >
            Analyze
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-800 text-sm font-medium shadow hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-stretch justify-between mb-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.6 }}
            className="bg-emerald-50 p-3 rounded-md shadow text-center flex-1"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-1">Current Electricity Production</h3>
            <p className="text-2xl font-bold text-emerald-600">
              <AnimatedNumber value={newTotalTWh} format={formatEnergy} duration={1} />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.7 }}
            className="text-2xl text-emerald-600 mx-3 self-center"
          >
            →
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.75 }}
            className="bg-emerald-100 p-3 rounded-md shadow text-center flex-1"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-1">Required Production in 2050</h3>
            <p className="text-2xl font-bold text-emerald-700">
              <AnimatedNumber value={predictedProduction} format={formatEnergy} duration={1} />
            </p>
            <p className="text-xs text-gray-600 mt-1">Based on 2% annual growth rate</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.85 }}
          className="bg-gray-200 rounded-full h-4 overflow-hidden"
        >
          <motion.div
            className="bg-emerald-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
