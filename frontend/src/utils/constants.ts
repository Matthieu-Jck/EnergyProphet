export const EPS = 1e-6;
export const TARGET_YEAR = 2050;
export const BASE_YEAR = 2025;
export const ANNUAL_GROWTH_RATE = 0.02;

export const CARD_ANIM_DURATION = 0.2;
export const GRID_BASE_DELAY = 0.1;
export const GRID_STEP_DELAY = 0.01;
export const HEADER_DELAY = 0.05;

/**
 * Minimal technology shape used across UI components
 */
export type Technology = {
  id: string;
  name: string;
};

export const TECHNOLOGIES: Technology[] = [
  { id: "hydro", name: "Hydro" },
  { id: "nuclear", name: "Nuclear" },
  { id: "wind", name: "Wind" },
  { id: "solar", name: "Solar" },
  { id: "biomass", name: "Biomass" },
  { id: "gas", name: "Gas" },
  { id: "oil", name: "Oil" },
  { id: "coal", name: "Coal" },
];

/**
 * Extended metadata for each technology (frontend-only).
 */
export type TechInfo = {
  green: boolean;
  controllable: boolean;
  co2: number;
  cost: number;
  renewable: "yes" | "no" | "debated";
};

export const TECH_INFO: Record<string, TechInfo> = {
  hydro: { green: true, controllable: true, co2: 5, cost: 40, renewable: "yes" },
  nuclear: { green: true, controllable: true, co2: 12, cost: 60, renewable: "debated" },
  wind: { green: true, controllable: false, co2: 15, cost: 45, renewable: "yes" },
  solar: { green: true, controllable: false, co2: 20, cost: 50, renewable: "yes" },
  biomass: { green: true, controllable: true, co2: 100, cost: 55, renewable: "debated" },
  gas: { green: false, controllable: true, co2: 450, cost: 55, renewable: "no" },
  oil: { green: false, controllable: true, co2: 650, cost: 75, renewable: "no" },
  coal: { green: false, controllable: true, co2: 820, cost: 70, renewable: "no" },
};