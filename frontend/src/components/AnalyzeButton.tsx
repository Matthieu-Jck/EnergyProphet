import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import TooltipPortal from "./TooltipPortal";
import { TARGET_YEAR } from "../utils/constants";
import type { Density } from "../hooks/useViewportDensity";
import api, { UserChange } from "../api";
import type { AnalysisResult } from "./AnalysisPopup";

interface Props {
  delayedBalanced: boolean;
  onReset: () => void;
  hasChanges: boolean;
  analyzePulseKey: number;
  showAnalyzeTip: boolean;
  setShowAnalyzeTip: (v: boolean) => void;
  density?: Density;
  selectedCountryId: string;
  changes?: UserChange[];
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setLoading: (v: boolean) => void;
}

export default function AnalyzeButton({
  delayedBalanced,
  onReset,
  hasChanges,
  analyzePulseKey,
  showAnalyzeTip,
  setShowAnalyzeTip,
  density = "normal",
  selectedCountryId,
  changes = [],
  setAnalysisResult,
  setLoading,
}: Props) {
  const analyzeBtnRef = useRef<HTMLButtonElement | null>(null);
  const clickedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // padding / sizing based on density
  const analyzePad =
    density === "ultra" ? "px-3 py-1.5" : density === "compact" ? "px-4 py-2" : "px-5 py-2.5";
  const analyzeText =
    density === "ultra" ? "text-sm" : density === "compact" ? "text-[15px]" : "text-base";
  const resetSize = density === "ultra" ? "w-7 h-7" : density === "compact" ? "w-9 h-9" : "w-10 h-10";
  const resetIcon = density === "ultra" ? "w-4 h-4" : density === "compact" ? "w-5 h-5" : "w-6 h-6";

  const handleAnalyze = async () => {
    if (!delayedBalanced) {
      setShowAnalyzeTip(true);
      clickedRef.current = true; // remember the click
      return;
    }

    setShowAnalyzeTip(false);
    setLoading(true);
    setIsProcessing(true);

    try {
      const result = await api.sendAnalysis(selectedCountryId, changes);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error sending analysis:", err);

      let errorMessage = "Failed to send analysis. Please try again.";
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response) {
          switch (axiosError.response.status) {
            case 400:
              errorMessage = "Bad request. Please check input.";
              break;
            case 404:
              errorMessage = "Resource not found.";
              break;
            case 500:
              errorMessage = "Internal server error. Try again later.";
              break;
            default:
              errorMessage = `Error ${axiosError.response.status}: ${(axiosError.response.data as any)?.message || "Unknown"}`;
          }
        } else if (axiosError.request) {
          errorMessage = "No response from server. Check your connection.";
        }
      } else if (err instanceof Error) {
        errorMessage = `Request error: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      clickedRef.current = false;
    }
  };

  // auto-trigger analysis if user clicked before balance was ready
  useEffect(() => {
    if (delayedBalanced && clickedRef.current) {
      handleAnalyze();
    }
  }, [delayedBalanced]);

  return (
    <div className="relative flex items-center justify-center mb-2 w-full">
      <motion.button
        ref={analyzeBtnRef}
        key={analyzePulseKey}
        whileHover={delayedBalanced && !isProcessing ? { y: -1 } : undefined}
        whileTap={delayedBalanced && !isProcessing ? { scale: 0.98 } : undefined}
        animate={delayedBalanced && !isProcessing ? { scale: [1, 1.06, 1] } : {}}
        transition={delayedBalanced && !isProcessing ? { duration: 0.35, ease: "easeInOut" } : {}}
        onClick={handleAnalyze}
        disabled={!delayedBalanced || isProcessing}
        title={!delayedBalanced ? "Finish prediction first" : undefined}
        className={`${analyzePad} rounded-lg ${analyzeText} font-semibold transition-colors transform-gpu ${
          delayedBalanced && !isProcessing
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
            : "bg-emerald-600/40 text-white/80 cursor-not-allowed shadow"
        }`}
      >
        {isProcessing ? "Analyzing…" : "Analyze"}
      </motion.button>

      {/* reset button */}
      <button
        onClick={onReset}
        aria-label="Reset adjustments"
        title={hasChanges ? "Reset" : "Nothing to reset"}
        className={`absolute right-0 inline-flex items-center justify-center ${resetSize} rounded-lg border border-transparent bg-white/60 transition ${
          hasChanges ? "opacity-80 hover:shadow-md hover:bg-white shadow-lg" : "opacity-10 pointer-events-none shadow"
        }`}
      >
        <img src="./icons/reset.png" alt="" className={resetIcon} />
      </button>

      {/* tooltip */}
      <TooltipPortal
        anchorRef={analyzeBtnRef}
        visible={showAnalyzeTip}
        onClose={() => setShowAnalyzeTip(false)}
      >
        <div className="text-center">
          Reach the required {TARGET_YEAR} production by adjusting the energy mix, then click <span className="font-semibold">Analyze</span> to review your choices.
        </div>
      </TooltipPortal>
    </div>
  );
}