import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import { CARD_ANIM_DURATION, GRID_BASE_DELAY, GRID_STEP_DELAY } from "../utils/constants";
import type { Density } from "../hooks/useViewportDensity";

export type DisplayTech = {
  id: string;
  name: string;
  share: number;
  shareColor: string;
  generationTWh: number;
  genColor: string;
  revealIndex: number;
  trend?: "up" | "down" | "none";
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
  firstLoad,
  density = "normal",
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
  density?: Density;
}) {
  const pad =
    density === "ultra" ? "p-2" : density === "compact" ? "p-2" : "p-2";
  const titleSize =
    density === "ultra"
      ? "text-xs"
      : density === "compact"
        ? "text-sm"
        : "text-sm";
  const metaSize =
    density === "ultra"
      ? "text-[9px]"
      : density === "compact"
        ? "text-[9px]"
        : "text-[10px]";
  const btnSize =
    density === "ultra"
      ? "h-7 w-7"
      : density === "compact"
        ? "h-7 w-7"
        : "h-8 w-8";
  const iconSize =
    density === "ultra"
      ? "h-5 w-5"
      : density === "compact"
        ? "h-5 w-5"
        : "h-6 w-6";

  const cardStateClass = isOpen
    ? "border-[#5f8f79] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(229,239,228,0.96))] shadow-[0_18px_40px_rgba(27,57,46,0.16)]"
    : "border-white/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(244,240,230,0.88))] shadow-[0_12px_26px_rgba(27,57,46,0.08)] hover:-translate-y-[1px] hover:border-[#92b59f] hover:shadow-[0_16px_30px_rgba(27,57,46,0.14)]";

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

  return (
    <motion.div
      key={tech.id}
      custom={tech.revealIndex}
      variants={cardVariants}
      initial={firstLoad ? "hidden" : false}
      animate="visible"
      ref={forwardedRef}
      onClick={onOpen}
      className={`relative grid min-h-[60px] cursor-pointer select-none grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-2 rounded-[22px] border ${pad} transition-all duration-200 ${cardStateClass}`}
    >
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(47,125,98,0.26),rgba(255,255,255,0))]" />

      <div className="flex flex-col items-center justify-center">
        <div className="mb-1 rounded-2xl border border-white/80 bg-white/70 p-2 shadow-[0_8px_18px_rgba(28,54,44,0.06)]">
          <img
            src={`./icons/${tech.id}.png`}
            alt={`${tech.name} icon`}
            className={iconSize}
            loading="lazy"
          />
        </div>
        <span
          className={`${titleSize} text-center font-semibold leading-tight text-[#173228]`}
        >
          {tech.name}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center border-l border-[#d7e3d7] pl-1">
        <div className="flex items-center gap-1">
          <span
            className={`text-center font-semibold ${titleSize} ${tech.shareColor}`}
          >
            <AnimatedNumber
              value={tech.share * 100}
              format={(v) => `${v.toFixed(0)}%`}
              duration={1}
            />
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`${metaSize} text-center transition-colors duration-300 ${tech.genColor}`}
          >
            <AnimatedNumber
              value={tech.generationTWh}
              format={(v) => `${Math.round(v)} TWh`}
              duration={1}
            />
          </span>
          {tech.trend === "up" && (
            <span
              className="text-xs font-bold leading-none text-green-600"
              aria-hidden
            >
              +
            </span>
          )}
          {tech.trend === "down" && (
            <span className="text-xs font-bold leading-none text-red-600" aria-hidden>
              -
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 top-1/2 z-[10] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-white/75 bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(239,245,235,0.95))] p-2 shadow-[0_18px_36px_rgba(27,57,46,0.18)] select-none">
              <button
                type="button"
                onClick={onIncrease}
                disabled={!canIncrease}
                className={`${btnSize} flex items-center justify-center rounded-xl border border-[#d7e1d6] transition ${!canIncrease
                  ? "cursor-not-allowed opacity-40"
                  : "bg-white/80 hover:bg-[#eef4ec] hover:shadow-sm"
                  }`}
                title="Increase by 20% of target gap"
                aria-label={`Increase ${tech.name}`}
              >
                <img
                  src="./icons/plus.png"
                  alt="Increase"
                  className={`${density === "ultra" ? "h-3 w-3" : "h-4 w-4"}`}
                />
              </button>

              <button
                type="button"
                onClick={onDecrease}
                disabled={!canDecrease}
                className={`${btnSize} flex items-center justify-center rounded-xl border border-[#d7e1d6] transition ${!canDecrease
                  ? "cursor-not-allowed opacity-40"
                  : "bg-white/80 hover:bg-[#eef4ec] hover:shadow-sm"
                  }`}
                title="Decrease by 20% of target gap"
                aria-label={`Decrease ${tech.name}`}
              >
                <img
                  src="./icons/minus.png"
                  alt="Decrease"
                  className={`${density === "ultra" ? "h-3 w-3" : "h-4 w-4"}`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
