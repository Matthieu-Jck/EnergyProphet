import { EPS } from "./constants";

export function nearlyEqual(a: number, b: number, eps = EPS) {
    return Math.abs(a - b) < eps;
}


export function formatEnergy(twh: number) {
    return `${Math.round(twh)} TWh`;
}


export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
