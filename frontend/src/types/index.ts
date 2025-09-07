export interface TechnologyEntry {
id: string;
name?: string;
share?: number; // 0..1
}

export interface Country {
id: string;
name: string;
totalGenerationTWh: number;
technologies: Array<{ id: string; share: number }>;
}