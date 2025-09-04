import { useState } from "react";

interface Props {
  userScenario: any;
  onResult: (analysis: string) => void;
}

export default function SimulateButton({ userScenario, onResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scenario/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userScenario),
      });

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();
      onResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSimulate}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Simulating..." : "Simulate"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
