import { motion } from "framer-motion";
import type { Density } from "../hooks/useViewportDensity";

export default function InfoPanel({
  openTechId,
  techInfo,
  allTechnologies,
  density = "normal",
}: {
  openTechId: string | null;
  techInfo: Record<
    string,
    {
      renewable: string;
      green: boolean;
      controllable: boolean;
      co2: number;
      cost: number;
    }
  >;
  allTechnologies: Array<{ id: string; name: string }>;
  density?: Density;
}) {
  const dens = <T,>(normal: T, compact: T, ultra: T) =>
    density === "ultra" ? ultra : density === "compact" ? compact : normal;

  if (!openTechId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex items-center justify-center w-full max-w-md"
      >
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
      </motion.div>
    );
  }

  const info = techInfo[openTechId];
  const tech = allTechnologies.find((t) => t.id === openTechId)!;

  const co2Color =
    info.co2 < 50
      ? "bg-emerald-200 text-emerald-900"
      : info.co2 < 200
      ? "bg-yellow-200 text-yellow-900"
      : info.co2 < 500
      ? "bg-orange-200 text-orange-900"
      : "bg-amber-800 text-white";

  const squareClasses = (extra: string = "") =>
    `flex flex-col items-center justify-center flex-1 rounded-lg shadow-sm ${extra} ${dens(
      "p-2",
      "p-1.5",
      "p-1"
    )}`;

  const textSm = dens("text-sm", "text-xs", "text-[11px]");
  const textXs = dens("text-[10px]", "text-[9px]", "text-[8px]");
  const textXXs = dens("text-[9px]", "text-[8px]", "text-[7px]");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex items-stretch justify-between w-full max-w-md ${dens(
        "gap-4",
        "gap-3",
        "gap-2"
      )}`}
    >
      {/* Technology name + icon */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img
          src={`./icons/${tech.id}.png`}
          alt={tech.name}
          className={`${dens("w-10 h-10 mb-1", "w-9 h-9 mb-1", "w-8 h-8 mb-0.5")} mx-auto`}
        />
        <span className={`${dens("text-[11px]", "text-[10px]", "text-[9px]")} font-medium text-gray-800`}>
          {tech.name}
        </span>
      </div>

      {/* CO₂ */}
      <div className={squareClasses(co2Color)}>
        <span className={`${textXs} font-medium`}>CO₂</span>
        <span className={`${textSm} font-bold`}>{info.co2} g</span>
        <span className={textXXs}>/kWh</span>
      </div>

      {/* Renewable */}
      <div
        className={squareClasses(
          info.renewable === "yes"
            ? "bg-emerald-200 text-emerald-900"
            : info.renewable === "no"
            ? "bg-red-200 text-red-900"
            : "bg-yellow-200 text-yellow-900"
        )}
      >
        <span className={`${textXs} font-medium`}>Renewable</span>
        <span className={`${textSm} font-bold`}>
          {info.renewable === "yes" ? "Yes" : info.renewable === "no" ? "No" : "Debated"}
        </span>
      </div>

      {/* Controllability */}
      <div
        className={squareClasses(
          info.controllable ? "bg-blue-200 text-blue-900" : "bg-red-200 text-red-900"
        )}
      >
        <span className={`${textXs} font-medium`}>Controlled</span>
        <span className={`${textSm} font-bold`}>{info.controllable ? "Yes" : "No"}</span>
      </div>
    </motion.div>
  );
}