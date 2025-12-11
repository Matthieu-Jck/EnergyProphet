import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export type AnalysisResult = {
  summary?: { countryName?: string };
  analysisText?: string;
};

export default function AnalysisPopup({
  result,
  onClose,
}: {
  result: AnalysisResult | null;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus Close button for accessibility
  useEffect(() => {
    if (result) closeBtnRef.current?.focus();
  }, [result]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!result) return null;

  const text = result.analysisText?.trim();
  const isError = text?.startsWith("⚠️");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          role="dialog"
          aria-modal="true"
          className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl p-4 flex flex-col"
        >
          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-center">
            AI Analysis for {result?.summary?.countryName ?? "Selected Country"}
          </h2>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-2 text-gray-800 text-sm sm:text-base leading-relaxed text-justify">
            {isError ? (
              <div className="text-red-600 font-semibold whitespace-pre-line">
                {text}
              </div>
            ) : text ? (
              <ReactMarkdown>{text}</ReactMarkdown>
            ) : (
              <div className="text-gray-500 italic">
                No analysis text available.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end">
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}