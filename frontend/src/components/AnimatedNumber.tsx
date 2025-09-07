import React, { useEffect, useState } from "react";
import { useMotionValue, animate } from "framer-motion";


export default function AnimatedNumber({
    value,
    format = (v: number) => v.toFixed(0),
    duration = 1,
}: {
    value: number;
    format?: (v: number) => string;
    duration?: number;
}) {
    const mv = useMotionValue(value);
    const [display, setDisplay] = useState(value);


    useEffect(() => {
        const controls = animate(mv, value, {
            duration,
            ease: "easeOut",
            onUpdate: (latest) => setDisplay(latest),
        });
        return controls.stop;
    }, [value, duration, mv]);


    return <>{format(display)}</>;
}