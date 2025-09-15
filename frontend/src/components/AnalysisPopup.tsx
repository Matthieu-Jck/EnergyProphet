import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export type AnalysisResult = {
  summary?: { countryName?: string };
  analysisText?: string;
};

export default function AnalysisPopup({
  result,
  onClose,
}: {
  result: AnalysisResult;
  onClose: () => void;
}) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl p-4 flex flex-col"
      >
        {/* Title */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-center">
          AI Analysis for {result?.summary?.countryName ?? "Country"}
        </h2>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto text-gray-800 text-xs sm:text-base leading-relaxed px-2 text-justify">
          <ReactMarkdown>
            {result?.analysisText || "No analysis text available."}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="mt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}