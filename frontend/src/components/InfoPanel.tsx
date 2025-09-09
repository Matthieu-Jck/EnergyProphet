import React from "react";
import { motion } from "framer-motion";
import type { Density } from "../hooks/useViewportDensity";

export default function InfoPanel({
  openTechId,
  techInfo,
  allTechnologies,
  density = "normal",
}: {
  openTechId: string | null;
  techInfo: Record<string, { green: boolean; controllable: boolean; co2: number; cost: number }>;
  allTechnologies: Array<{ id: string; name: string }>;
  density?: Density;
}) {
  const dens = <T,>(normal: T, compact: T, ultra: T) =>
    density === "ultra" ? ultra : density === "compact" ? compact : normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex items-center w-full max-w-md ${dens("gap-6", "gap-5", "gap-4")}`}
    >
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
            <>
              <div className={`flex flex-col items-center justify-center ${dens("w-20", "w-16", "w-14")}`}>
                <img
                  src={`./icons/${tech.id}.png`}
                  alt={tech.name}
                  className={`${dens("w-10 h-10 mb-1", "w-9 h-9 mb-1", "w-8 h-8 mb-0.5")}`}
                />
                <span className={`${dens("text-[11px]", "text-[10px]", "text-[9px]")} font-medium text-gray-800`}>{tech.name}</span>
              </div>

              <div className={`flex flex-1 justify-around ${dens("gap-3", "gap-2", "gap-2")}`}>
                <div
                  className={`flex flex-col items-center justify-center rounded-lg shadow-sm ${co2Color} ${dens(
                    "w-16 h-16",
                    "w-14 h-14",
                    "w-12 h-12"
                  )}`}
                >
                  <span className={`${dens("text-[10px]", "text-[9px]", "text-[8px]")} font-medium`}>CO₂</span>
                  <span className={`${dens("text-sm", "text-xs", "text-[11px]")} font-bold`}>{info.co2} g</span>
                  <span className={`${dens("text-[9px]", "text-[8px]", "text-[7px]")}`}>/kWh</span>
                </div>

                <div
                  className={`flex flex-col items-center justify-center rounded-lg shadow-sm bg-gray-200 text-gray-900 ${dens(
                    "w-16 h-16",
                    "w-14 h-14",
                    "w-12 h-12"
                  )}`}
                >
                  <span className={`${dens("text-[10px]", "text-[9px]", "text-[8px]")} font-medium`}>Price</span>
                  <span className={`${dens("text-sm", "text-xs", "text-[11px]")} font-bold`}>€{info.cost}</span>
                  <span className={`${dens("text-[9px]", "text-[8px]", "text-[7px]")}`}>/TWh</span>
                </div>
              </div>
            </>
          );
        })()
      ) : (
        <motion.span
          key="placeholder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={`${dens("text-[12px]", "text-[11px]", "text-[10px]")} text-gray-400 italic`}
        >
          Click an energy source to see details
        </motion.span>
      )}
    </motion.div>
  );
}
