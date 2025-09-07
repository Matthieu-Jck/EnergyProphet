import React, { useEffect, useRef, useState } from "react";


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
}) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState({ left: 0, top: 0, arrowLeft: 0, measured: false });


    useEffect(() => {
        if (!visible) return;


        let raf = 0;


        const update = () => {
            const anchor = anchorRef?.current as HTMLElement | null;
            const el = elRef.current;
            if (!anchor || !el) return;


            const anchorRect = anchor.getBoundingClientRect();
            const tooltipWidth = Math.min(el.offsetWidth || maxWidth, maxWidth);


            const anchorCenterX = anchorRect.left + anchorRect.width / 2 + window.scrollX;
            let left = anchorCenterX - tooltipWidth / 2;
            const minLeft = 8 + window.scrollX;
            const maxLeft = window.innerWidth - tooltipWidth - 8 + window.scrollX;
            left = Math.max(minLeft, Math.min(left, maxLeft));


            const top = anchorRect.bottom + gap + window.scrollY;
            const arrowLeft = anchorCenterX - left;


            setPos({ left, top, arrowLeft, measured: true });
        };


        raf = requestAnimationFrame(update);


        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };


        window.addEventListener("resize", onScroll);
        window.addEventListener("scroll", onScroll, true);


        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onScroll);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [visible, anchorRef, maxWidth, gap]);


    if (typeof document === "undefined") return null;
}