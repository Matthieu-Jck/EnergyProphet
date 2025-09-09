import React from "react";
import { motion } from "framer-motion";
import type { Density } from "../hooks/useViewportDensity";

export default function ProgressBar({
  progress,
  progressIsFull,
  onAnimationComplete,
  density = "normal",
}: {
  progress: number;
  progressIsFull: boolean;
  onAnimationComplete?: () => void;
  density?: Density;
}) {
  const dens = <T,>(normal: T, compact: T, ultra: T) =>
    density === "ultra" ? ultra : density === "compact" ? compact : normal;

  return (
    <div
      className={`relative bg-gray-200 rounded-full overflow-hidden ${dens(
        "h-[26px]",
        "h-[22px]",
        "h-[20px]"
      )}`}
      aria-label="Progress toward required 2050 production"
    >
      <motion.div
        className={`${progressIsFull ? "bg-emerald-600" : "bg-emerald-400"} h-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        onAnimationComplete={onAnimationComplete}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center font-semibold text-white drop-shadow">
        {/* Intentionally leaving content slot empty so parent can place AnimatedNumber if desired */}
      </div>
    </div>
  );
}