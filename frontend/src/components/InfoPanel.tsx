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
        className="flex w-full max-w-md items-center justify-center"
      >
        <motion.span
          key="placeholder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={`${dens("text-[12px]", "text-[11px]", "text-[10px]")} text-[#6c8377] italic`}
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
      ? "bg-[#dceee0] text-[#28533e]"
      : info.co2 < 200
      ? "bg-[#f5e6bf] text-[#7b5922]"
      : info.co2 < 500
      ? "bg-[#f3c9ad] text-[#7a4727]"
      : "bg-[#8f4d3f] text-white";

  const squareClasses = (extra: string = "") =>
    `flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/70 shadow-[0_10px_24px_rgba(30,59,47,0.08)] ${extra} ${dens(
      "p-2.5",
      "p-2",
      "p-1.5"
    )}`;

  const textSm = dens("text-sm", "text-xs", "text-[11px]");
  const textXs = dens("text-[10px]", "text-[9px]", "text-[8px]");
  const textXXs = dens("text-[9px]", "text-[8px]", "text-[7px]");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full max-w-md items-stretch justify-between ${dens(
        "gap-4",
        "gap-3",
        "gap-2"
      )}`}
    >
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/70 bg-white/70 shadow-[0_10px_24px_rgba(30,59,47,0.08)]">
        <img
          src={`./icons/${tech.id}.png`}
          alt={tech.name}
          className={`${dens("mb-1 h-10 w-10", "mb-1 h-9 w-9", "mb-0.5 h-8 w-8")} mx-auto`}
        />
        <span className={`${dens("text-[11px]", "text-[10px]", "text-[9px]")} font-semibold text-[#173228]`}>
          {tech.name}
        </span>
      </div>

      <div className={squareClasses(co2Color)}>
        <span className={`${textXs} font-medium uppercase tracking-[0.16em]`}>CO2</span>
        <span className={`${textSm} font-bold`}>{info.co2} g</span>
        <span className={textXXs}>/kWh</span>
      </div>

      <div
        className={squareClasses(
          info.renewable === "yes"
            ? "bg-[#dceee0] text-[#28533e]"
            : info.renewable === "no"
            ? "bg-[#f0cbc6] text-[#7c413b]"
            : "bg-[#f5e6bf] text-[#7b5922]"
        )}
      >
        <span className={`${textXs} font-medium uppercase tracking-[0.1em]`}>Renewable</span>
        <span className={`${textSm} font-bold`}>
          {info.renewable === "yes" ? "Yes" : info.renewable === "no" ? "No" : "Debated"}
        </span>
      </div>

      <div
        className={squareClasses(
          info.controllable ? "bg-[#d8e8f3] text-[#264f72]" : "bg-[#f0cbc6] text-[#7c413b]"
        )}
      >
        <span className={`${textXs} font-medium uppercase tracking-[0.1em]`}>Controlled</span>
        <span className={`${textSm} font-bold`}>{info.controllable ? "Yes" : "No"}</span>
      </div>
    </motion.div>
  );
}
