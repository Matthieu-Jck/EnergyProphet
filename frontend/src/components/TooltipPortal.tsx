import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TooltipPortal({
  anchorRef,
  visible,
  maxWidth = 300,
  gap = 8,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  maxWidth?: number;
  gap?: number;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({
    left: 0,
    top: 0,
    arrowLeft: 0,
  });

  useEffect(() => {
    if (!visible) return;

    let raf = 0;

    const update = () => {
      const anchor = anchorRef?.current as HTMLElement | null;
      const el = elRef.current;
      if (!anchor || !el) return;

      const anchorRect = anchor.getBoundingClientRect();
      const tooltipWidth = Math.min(el.offsetWidth || maxWidth, maxWidth);

      const anchorCenterX =
        anchorRect.left + anchorRect.width / 2 + window.scrollX;
      let left = anchorCenterX - tooltipWidth / 2;
      const minLeft = 8 + window.scrollX;
      const maxLeft = window.innerWidth - tooltipWidth - 8 + window.scrollX;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      const top = anchorRect.bottom + gap + window.scrollY;
      const arrowLeft = anchorCenterX - left;

      setPos({ left, top, arrowLeft });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [visible, anchorRef, maxWidth, gap]);

  if (typeof document === "undefined" || !visible) return null;

  return createPortal(
    <div
      ref={elRef}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        maxWidth,
        zIndex: 9999,
      }}
      className="rounded-[18px] border border-[#f1d4a6]/20 bg-[#173228]/96 px-4 py-3 text-sm text-[#f8f5ee] shadow-[0_18px_34px_rgba(8,21,16,0.28)] backdrop-blur-md"
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: pos.arrowLeft - 6,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid #173228",
        }}
      />
    </div>,
    document.body
  );
}
