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

  useEffect(() => {
    if (result) closeBtnRef.current?.focus();
  }, [result]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!result) return null;

  const text = result.analysisText?.trim();
  const isError = Boolean(text && /^(warning|error|failed)/i.test(text));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04120d]/55 px-4 py-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          role="dialog"
          aria-modal="true"
          className="panel-shell flex max-h-[88svh] w-full max-w-4xl flex-col overflow-hidden p-5 sm:p-6"
        >
          <h2 className="section-title mb-1 text-lg sm:text-xl md:text-2xl">
            AI Analysis for {result?.summary?.countryName ?? "Selected Country"}
          </h2>
          <p className="section-copy mb-4 text-sm">
            A qualitative review of the scenario you built for the 2050 target.
          </p>

          <div className="subtle-frame flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-justify sm:text-base">
            {isError ? (
              <div className="whitespace-pre-line rounded-2xl border border-[#e7c3be] bg-[#fff5f3] px-4 py-3 font-semibold text-[#964a42]">
                {text}
              </div>
            ) : text ? (
              <div className="analysis-markdown">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            ) : (
              <div className="italic text-[#6d8378]">
                No analysis text available.
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              ref={closeBtnRef}
              onClick={onClose}
              className="rounded-[18px] border border-[#2c5f4d] bg-[linear-gradient(135deg,#356f58_0%,#4f9873_100%)] px-5 py-2 text-white shadow-[0_18px_34px_rgba(32,73,58,0.22)] transition hover:shadow-[0_20px_38px_rgba(32,73,58,0.28)] focus:outline-none focus:ring-2 focus:ring-[#c88a46]/50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
