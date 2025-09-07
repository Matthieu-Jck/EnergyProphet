import React from "react";
import { motion } from "framer-motion";
import type { TechnologyEntry } from "../types";

export default function InfoPanel({
  openTechId,
  techInfo,
  allTechnologies,
}: {
  openTechId: string | null;
  techInfo: Record<string, { green: boolean; controllable: boolean; co2: number; cost: number }>;
  allTechnologies: Array<{ id: string; name: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-6 w-full max-w-md"
    >
      {openTechId ? (
        (() => {
          const info = techInfo[openTechId];
          const tech = allTechnologies.find((t) => t.id === openTechId)!;
          const co2 = info.co2;
          const co2Color =
            co2 < 50 ? "bg-emerald-200 text-emerald-900" : co2 < 200 ? "bg-yellow-200 text-yellow-900" : co2 < 500 ? "bg-orange-200 text-orange-900" : "bg-amber-800 text-white";

          return (
            <>
              <div className="flex flex-col items-center justify-center w-20">
                <img src={`/icons/${tech.id}.png`} alt={tech.name} className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-medium text-gray-800">{tech.name}</span>
              </div>

              <div className="flex flex-1 justify-around gap-3">
                <div className={`flex flex-col items-center justify-center rounded-lg shadow-sm ${co2Color} w-16 h-16`}>
                  <span className="text-[10px] font-medium">CO₂</span>
                  <span className="text-xs font-bold">{info.co2} g</span>
                  <span className="text-[9px]">/kWh</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg shadow-sm bg-gray-200 text-gray-900 w-16 h-16">
                  <span className="text-[10px] font-medium">Price</span>
                  <span className="text-xs font-bold">€{info.cost}</span>
                  <span className="text-[9px]">/TWh</span>
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
          className="text-gray-400 italic"
        >
          Click an energy source to see details
        </motion.span>
      )}
    </motion.div>
  );
}