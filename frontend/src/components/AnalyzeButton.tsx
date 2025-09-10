import React, { useRef } from "react";
import { motion } from "framer-motion";
import TooltipPortal from "./TooltipPortal";
import { TARGET_YEAR } from "../utils/constants";
import type { Density } from "../hooks/useViewportDensity";

export default function AnalyzeButton({
  delayedBalanced,
  onAnalyze,
  onReset,
  hasChanges,
  analyzePulseKey,
  showAnalyzeTip,
  setShowAnalyzeTip,
  density = "normal",
}: {
  delayedBalanced: boolean;
  onAnalyze: () => void;
  onReset: () => void;
  hasChanges: boolean;
  analyzePulseKey: number;
  showAnalyzeTip: boolean;
  setShowAnalyzeTip: (v: boolean) => void;
  density?: Density;
}) {
  const analyzeBtnRef = useRef<HTMLButtonElement | null>(null);

  const analyzePad =
    density === "ultra"
      ? "px-3 py-1.5"
      : density === "compact"
        ? "px-4 py-2"
        : "px-5 py-2.5";
  const analyzeText =
    density === "ultra"
      ? "text-sm"
      : density === "compact"
        ? "text-[15px]"
        : "text-base";
  const resetSize =
    density === "ultra"
      ? "w-7 h-7"
      : density === "compact"
        ? "w-9 h-9"
        : "w-10 h-10";
  const resetIcon =
    density === "ultra"
      ? "w-4 h-4"
      : density === "compact"
        ? "w-5 h-5"
        : "w-6 h-6";

  return (
    <div className="relative flex items-center justify-center mb-2 w-full">
      <motion.button
        ref={analyzeBtnRef}
        key={analyzePulseKey}
        whileHover={delayedBalanced ? { y: -1 } : undefined}
        whileTap={delayedBalanced ? { scale: 0.98 } : undefined}
        animate={delayedBalanced ? { scale: [1, 1.06, 1] } : {}}
        transition={
          delayedBalanced ? { duration: 0.35, ease: "easeInOut" } : {}
        }
        onClick={delayedBalanced ? onAnalyze : () => setShowAnalyzeTip(true)}
        aria-disabled={!delayedBalanced}
        title={
          !delayedBalanced ? "Finish your prediction to analyze" : undefined
        }
        className={`${analyzePad} rounded-lg ${analyzeText} font-semibold transition-colors transform-gpu ${delayedBalanced
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
            : "bg-emerald-600/40 text-white/80 cursor-not-allowed shadow"
          }`}
      >
        Analyze
      </motion.button>

      <button
        onClick={onReset}
        aria-label="Reset adjustments"
        title={hasChanges ? "Reset" : "Nothing to reset"}
        className={`absolute right-0 inline-flex items-center justify-center ${resetSize} rounded-lg border border-transparent bg-white/60 transition ${hasChanges
            ? "opacity-80 hover:shadow-md hover:bg-white shadow-lg"
            : "opacity-10 pointer-events-none shadow"
          }`}
      >
        <img src="./icons/reset.png" alt="" className={resetIcon} />
      </button>

      <TooltipPortal
        anchorRef={analyzeBtnRef}
        visible={showAnalyzeTip}
        onClose={() => setShowAnalyzeTip(false)}
      >
        <div className="text-center">
          Reach the required {TARGET_YEAR} production by adjusting the energy
          mix, then click <span className="font-semibold">Analyze</span> to
          review your choices.
        </div>
      </TooltipPortal>
    </div>
  );
}