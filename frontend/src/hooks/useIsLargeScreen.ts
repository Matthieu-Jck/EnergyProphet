import { useEffect, useState } from "react";

export function useIsLargeScreen(breakpoint = 840): boolean {
  const [isLarge, setIsLarge] = useState<boolean>(false);

  useEffect(() => {
    const check = () => {
      setIsLarge(window.innerWidth >= breakpoint);
    };
    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isLarge;
}