export interface TechnologyEntry {
  id: string;
  name: string;
  share?: number; // 0..1
  green: boolean;
  controllable: boolean;
  co2: number;
  cost: number;
}
export interface Country {
id: string;
name: string;
totalGenerationTWh: number;
technologies: Array<{ id: string; share: number }>;
}

export type UserChange = {
  id: string;
  prevShare?: number; // 0..1
  prevTWh?: number;
  newShare: number;
  newTWh: number;
};
