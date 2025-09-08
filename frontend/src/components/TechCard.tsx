import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import { CARD_ANIM_DURATION, GRID_BASE_DELAY, GRID_STEP_DELAY } from "../utils/constants";

export type DisplayTech = {
  id: string;
  name: string;
  share: number; // 0..1
  shareColor: string;
  generationTWh: number;
  genColor: string;
  revealIndex: number;
};

export default function TechCard({
  tech,
  isOpen,
  onOpen,
  onIncrease,
  onDecrease,
  canIncrease,
  canDecrease,
  forwardedRef,
  colIndex,
  firstLoad,
}: {
  tech: DisplayTech;
  isOpen: boolean;
  onOpen: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  forwardedRef?: (el: HTMLDivElement | null) => void;
  colIndex: number;
  firstLoad: boolean;
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (revealIndex: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: CARD_ANIM_DURATION,
        delay: GRID_BASE_DELAY + revealIndex * GRID_STEP_DELAY,
      },
    }),
  } as const;

  const sideClass = colIndex === 0 ? "left-full ml-2" : "right-full mr-2";

  return (
    <motion.div
      key={tech.id}
      custom={tech.revealIndex}
      variants={cardVariants}
      initial={firstLoad ? "hidden" : false}
      animate="visible"
      ref={forwardedRef}
      onClick={onOpen}
      className={`relative grid grid-cols-2 gap-2 border rounded-lg p-2 ${isOpen ? "bg-gray-100" : "bg-white"} hover:bg-gray-100 hover:shadow-sm transition-all duration-200 min-h-[56px] cursor-pointer`}
    >
      <div className="flex flex-col items-center justify-center">
        <img src={`./icons${tech.id}.png`} alt={`${tech.name} icon`} className="w-7 h-7 mb-1" loading="lazy" />
        <span className="text-xs font-medium text-center text-gray-800">{tech.name}</span>
      </div>

      <div className="flex flex-col items-center justify-center border-l border-emerald-100 pl-1">
        <span className={`font-semibold text-base text-center transition-colors duration-300 ${tech.shareColor}`}>
          <AnimatedNumber value={tech.share * 100} format={(v) => `${v.toFixed(0)}%`} duration={1} />
        </span>
        <span className={`text-xs text-center transition-colors duration-300 ${tech.genColor}`}>
          <AnimatedNumber value={tech.generationTWh} format={(v) => `${Math.round(v)} TWh`} duration={1} />
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, scale: 0.9, y: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-50%" }}
            transition={{ duration: 0.2 }}
            className={`absolute top-1/2 ${sideClass} z-[10]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex flex-col items-center bg-white border border-emerald-200 rounded-xl shadow-lg p-2 gap-2">
              <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${colIndex === 0 ? "-left-2" : "-right-2"}`}>
                <div className={`${colIndex === 0 ? "border-y-[8px] border-y-transparent border-r-[8px] border-r-emerald-500" : "border-y-[8px] border-y-transparent border-l-[8px] border-l-emerald-500"}`} />
              </div>

              <button
                type="button"
                onClick={onIncrease}
                disabled={!canIncrease}
                className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${!canIncrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                title="Increase by 20% of target gap"
                aria-label={`Increase ${tech.name}`}
              >
                <img src="./icons/plus.png" alt="Increase" className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onDecrease}
                disabled={!canDecrease}
                className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition ${!canDecrease ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                title="Decrease by 20% of target gap"
                aria-label={`Decrease ${tech.name}`}
              >
                <img src="./icons/minus.png" alt="Decrease" className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}