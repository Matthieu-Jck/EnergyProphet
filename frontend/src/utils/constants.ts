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
  { id: "solar", name: "Solar" },
  { id: "wind", name: "Wind" },
  { id: "biomass", name: "Biomass" },
  { id: "coal", name: "Coal" },
  { id: "oil", name: "Oil" },
  { id: "gas", name: "Gas" },
];

/**
 * Extended metadata for each technology (frontend-only).
 */
export type TechInfo = {
  green: boolean;
  controllable: boolean;
  co2: number;
  cost: number;
};

export const TECH_INFO: Record<string, TechInfo> = {
  hydro: { green: true, controllable: true, co2: 5, cost: 40 },
  nuclear: { green: true, controllable: true, co2: 12, cost: 60 },
  solar: { green: true, controllable: false, co2: 20, cost: 50 },
  wind: { green: true, controllable: false, co2: 15, cost: 45 },
  biomass: { green: true, controllable: true, co2: 100, cost: 55 },
  coal: { green: false, controllable: true, co2: 820, cost: 70 },
  oil: { green: false, controllable: true, co2: 650, cost: 75 },
  gas: { green: false, controllable: true, co2: 450, cost: 55 },
};
