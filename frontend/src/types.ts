export interface Technology {
    id: string
    name: string
    share: number
    emissionFactor_tCO2_per_MWh: number
    importTonsPerMWh: number
    unitCostUsdPerMWh: number
    importResource?: string
}


export interface Country {
    id: string
    name: string
    totalGenerationTWh: number
    technologies: Technology[]
}


export interface PolicyInput {
    countryId: string
    targetYear: number
    shares: Record<string, number>
}


export interface SimulationResult {
    year: number
    co2Mt: number
    totalCostUsd: number
    imports: Record<string, number>
    generationTWh: Record<string, number>
}