import { Country } from "../types";
import { motion, useMotionValue, animate } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface Props {
  country: Country;
  onSimulate?: () => void;
}

/** Animated number (Gives a smooth numeric interpolation) */
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
  // interactive state that must reset when the country changes
  const [added, setAdded] = useState<Record<string, number>>({});
  const [icons, setIcons] = useState(
    Array.from({ length: 5 }, (_, i) => ({ id: i, used: false }))
  );
  const [currentDragIndex, setCurrentDragIndex] = useState(-1);

  // refs for hit-testing drops
  const iconRefs = useRef<(HTMLImageElement | null)[]>([]);
  const techRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // firstLoad ensures the energy cards animate only on the very first page load
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    // flip after first paint
    setFirstLoad(false);
  }, []);

  // keep track of the previous country id so we only reset when it actually changes
  const prevCountryIdRef = useRef<string>(country.id);

  useEffect(() => {
    if (prevCountryIdRef.current !== country.id) {
      // Country changed -> reset interactive state
      setAdded({});
      setIcons(Array.from({ length: 5 }, (_, i) => ({ id: i, used: false })));
      setCurrentDragIndex(-1);
      // update prev id
      prevCountryIdRef.current = country.id;
    }
    // we intentionally do NOT change `firstLoad` here — we want the firstLoad animation only once per site load
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
  const predictedProduction =
    baseProduction * Math.pow(1 + annualGrowthRate, years);
  const difference = predictedProduction - baseProduction;
  const unitAddition = difference / icons.length; // each icon adds this many TWh

  const addedTotal = Object.values(added).reduce((s, v) => s + v, 0);
  const newTotalTWh = baseProduction + addedTotal;

  // Build display rows including color logic (black/green/red)
  const displayTechs = allTechnologies
    .map((base) => {
      const tech = country.technologies.find((t) => t.id === base.id);
      const originalShare = tech ? tech.share : 0;

      const originalGenerationTWh = originalShare * baseProduction;
      const addedThis = added[base.id] || 0;

      const newGenerationTWh = originalGenerationTWh + addedThis;
      const newShare = newTotalTWh > 0 ? newGenerationTWh / newTotalTWh : 0;

      const shareColor =
        newShare > originalShare
          ? "text-green-600"
          : newShare < originalShare
          ? "text-red-600"
          : "text-black";

      const genColor =
        newGenerationTWh > originalGenerationTWh
          ? "text-green-600"
          : newGenerationTWh < originalGenerationTWh
          ? "text-red-600"
          : "text-black";

      const generationGWh = newGenerationTWh * 1000;

      return {
        ...base,
        share: newShare,
        shareColor,
        generationGWh,
        genColor,
      };
    })
    .sort((a, b) => b.share - a.share);

  const leftColumn = displayTechs.filter((_, i) => i % 2 === 0);
  const rightColumn = displayTechs.filter((_, i) => i % 2 !== 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.2 + i * 0.04 },
    }),
  };

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.4 + i * 0.04 },
    }),
  };

  const formatEnergy = (gwh: number) =>
    gwh > 999 ? `${Math.round(gwh / 1000)} TWh` : `${Math.round(gwh)} GWh`;

  const allUsed = icons.every((ic) => ic.used);
  const isBalanced = Math.abs(newTotalTWh - predictedProduction) < 1e-9;

  const handleReset = () => {
    setAdded({});
    setIcons(Array.from({ length: 5 }, (_, i) => ({ id: i, used: false })));
    setCurrentDragIndex(-1);
  };

  const progress = Math.min((newTotalTWh / predictedProduction) * 100, 100);

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

      {/* Energy cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 overflow-hidden">
        {[leftColumn, rightColumn].map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3">
            {col.map((t, index) => (
              <motion.div
                key={t.id}
                custom={index}
                variants={cardVariants}
                initial={firstLoad ? "hidden" : false}
                animate={firstLoad ? "visible" : false}
                ref={(el) => (techRefs.current[t.id] = el)}
                className="grid grid-cols-2 gap-2 border rounded-md p-2 bg-gray-50 hover:shadow transition-shadow duration-200 min-h-[56px]"
              >
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={`/icons/${t.id}.png`}
                    alt={`${t.name} icon`}
                    className="w-7 h-7 mb-1"
                  />
                  <span className="text-xs font-medium text-center text-gray-800">
                    {t.name}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center border-l border-emerald-100 pl-1">
                  <span
                    className={`font-semibold text-base text-center transition-colors duration-300 ${t.shareColor}`}
                  >
                    <AnimatedNumber
                      value={t.share * 100}
                      format={(v) => `${v.toFixed(0)}%`}
                      duration={1}
                    />
                  </span>
                  <span
                    className={`text-xs text-center transition-colors duration-300 ${t.genColor}`}
                  >
                    <AnimatedNumber
                      value={t.generationGWh}
                      format={formatEnergy}
                      duration={1}
                    />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Power icon area with instruction text */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex justify-center items-center gap-2 min-h-[44px] bg-emerald-50 border border-emerald-200 rounded-md p-3 w-full">
          {allUsed && isBalanced ? (
            <div className="flex gap-2">
              <button
                onClick={() => onSimulate?.()}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 transition-colors"
              >
                Simulate
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-800 text-sm font-medium shadow hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            icons.map(
              (icon, index) =>
                !icon.used && (
                  <DraggablePowerIcon
                    key={icon.id}
                    icon={icon}
                    index={index}
                    iconRefs={iconRefs}
                    techRefs={techRefs}
                    setAdded={setAdded}
                    setIcons={setIcons}
                    setCurrentDragIndex={setCurrentDragIndex}
                    unitAddition={unitAddition}
                  />
                )
            )
          )}
        </div>
        <p className="text-sm text-center text-gray-700 font-medium">
          Drag and drop a power icon onto an energy source above to increase its
          production by {formatEnergy(unitAddition * 1000)} (20% of the 2050
          goal).
        </p>
      </div>

      {/* Production comparison and progress bar */}
      <div className="mt-auto">
        <div className="flex items-stretch justify-between mb-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.6 }}
            className="bg-emerald-50 p-3 rounded-md shadow text-center flex-1"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-1">
              Current Electricity Production
            </h3>
            <p className="text-2xl font-bold text-emerald-600">
              <AnimatedNumber
                value={newTotalTWh * 1000}
                format={formatEnergy}
                duration={1}
              />
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
            <h3 className="text-lg font-semibold text-emerald-800 mb-1">
              Required Production in 2050
            </h3>
            <p className="text-2xl font-bold text-emerald-700">
              <AnimatedNumber
                value={predictedProduction * 1000}
                format={formatEnergy}
                duration={1}
              />
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Based on 2% annual growth rate
            </p>
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

/** Separate draggable icon with precise cursor tracking and no CSS transform transitions */
function DraggablePowerIcon({
  icon,
  index,
  iconRefs,
  techRefs,
  setAdded,
  setIcons,
  setCurrentDragIndex,
  unitAddition,
}: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.img
      key={icon.id}
      src="/icons/power.png"
      alt="Power icon (draggable)"
      className="w-10 h-10 cursor-grab transform-gpu select-none"
      ref={(el) => {
        iconRefs.current[index] = el;
      }}
      drag
      dragConstraints={false}
      dragElastic={0}
      dragMomentum={false}
      style={{
        x,
        y,
        touchAction: "none", // prevent browser gestures that add latency
        willChange: "transform", // hint compositor
      }}
      // Use Framer for hover scale so CSS doesn't animate transforms
      whileHover={{ scale: 1.1 }}
      whileTap={{ cursor: "grabbing" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, delay: 0.4 + index * 0.04 },
        },
      }}
      initial="hidden"
      animate="visible"
      onDragStart={() => setCurrentDragIndex(icon.id)}
      onDragEnd={(e, info) => {
        const point = info.point;
        let droppedOn: string | null = null;

        for (const [id, ref] of Object.entries(techRefs.current)) {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            if (
              point.x > rect.left &&
              point.x < rect.right &&
              point.y > rect.top &&
              point.y < rect.bottom
            ) {
              droppedOn = id;
              break;
            }
          }
        }

        if (droppedOn) {
          setAdded((prev: any) => ({
            ...prev,
            [droppedOn]: (prev[droppedOn] || 0) + unitAddition,
          }));
          setIcons((prev: any) =>
            prev.map((ic: any) =>
              ic.id === icon.id ? { ...ic, used: true } : ic
            )
          );
        } else {
          // snap back instantly (no CSS transition to cause lag)
          x.set(0);
          y.set(0);
        }

        setCurrentDragIndex(-1);
      }}
    />
  );
}
