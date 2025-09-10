import { useEffect, useState } from "react";

export type Density = "normal" | "compact" | "ultra";

/**
 * Chooses a density based on visible viewport height.
 * Tweak thresholds to your taste / device matrix.
 */
export function useViewportDensity(): Density {
  const [density, setDensity] = useState<Density>("normal");

  useEffect(() => {
    const calc = () => {
      const h = (window.visualViewport?.height ?? window.innerHeight) || 0;
      if (h <= 710) setDensity("ultra");
      else if (h <= 815) setDensity("compact");
      else setDensity("normal");
    };
    calc();

    window.addEventListener("resize", calc);
    window.visualViewport?.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.visualViewport?.removeEventListener("resize", calc as any);
    };
  }, []);

  return density;
}
