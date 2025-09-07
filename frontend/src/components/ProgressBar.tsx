import React from "react";
import { motion } from "framer-motion";

export default function ProgressBar({
    progress,
    progressIsFull,
    onAnimationComplete,
}: {
    progress: number;
    progressIsFull: boolean;
    onAnimationComplete?: () => void;
}) {
    return (
        <div className="relative bg-gray-200 rounded-full h-[22px] overflow-hidden" aria-label="Progress toward required 2050 production">
            <motion.div
                className={`${progressIsFull ? "bg-emerald-600" : "bg-emerald-400"} h-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                onAnimationComplete={onAnimationComplete}
                aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white drop-shadow">
            </div>
        </div>
    );
}