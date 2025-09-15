using EnergyProphet.Api.Models;


namespace EnergyProphet.Data
{
    public static class CountryStore
    {
        public static readonly List<Country> Countries = new()
        {
            new Country
            {
                Id = "che",
                Name = "Switzerland",
                TotalGenerationTWh = 72.1,
                Technologies = new List<Technology>
                {
                    new Technology{ Id="hydro", Name="Hydro", Share=0.57, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=50 },
                    new Technology{ Id="nuclear", Name="Nuclear", Share=0.32, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                    new Technology{ Id="solar", Name="Solar", Share=0.08, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=55 },
                    new Technology{ Id="wind", Name="Wind", Share=0.03, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                }
            },
            new Country
            {
                Id = "fra",
                Name = "France",
                TotalGenerationTWh = 536.5,
                Technologies = new List<Technology>
                {
                    new Technology{ Id="nuclear", Name="Nuclear", Share=0.67, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                    new Technology{ Id="hydro", Name="Hydro", Share=0.14, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=50 },
                    new Technology{ Id="wind", Name="Wind", Share=0.09, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                    new Technology{ Id="solar", Name="Solar", Share=0.04, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=55 },
                    new Technology{ Id="gas", Name="Gas", Share=0.06, EmissionFactor_tCO2_per_MWh=0.5, ImportTonsPerMWh=0.2, UnitCostUsdPerMWh=50, ImportResource="Gas" },
                }
            },
            new Country
            {
                Id = "deu",
                Name = "Germany",
                TotalGenerationTWh = 432,
                Technologies = new List<Technology>
                {
                    new Technology{ Id="wind", Name="Wind", Share=0.31, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                    new Technology{ Id="solar", Name="Solar", Share=0.16, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=55 },
                    new Technology{ Id="hydro", Name="Hydro", Share=0.05, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=50 },
                    new Technology{ Id="bio", Name="Bioenergy", Share=0.10, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=70 },
                    new Technology{ Id="coal", Name="Coal", Share=0.23, EmissionFactor_tCO2_per_MWh=0.9, ImportTonsPerMWh=0.4, UnitCostUsdPerMWh=40, ImportResource="Coal" },
                    new Technology{ Id="gas", Name="Gas", Share=0.15, EmissionFactor_tCO2_per_MWh=0.5, ImportTonsPerMWh=0.2, UnitCostUsdPerMWh=50, ImportResource="Gas" },
                }
            },
            new Country
            {
                Id = "ita",
                Name = "Italy",
                TotalGenerationTWh = 264,
                Technologies = new List<Technology>
                {
                    new Technology{ Id="gas", Name="Gas", Share=0.45, EmissionFactor_tCO2_per_MWh=0.5, ImportTonsPerMWh=0.2, UnitCostUsdPerMWh=50, ImportResource="Gas" },
                    new Technology{ Id="hydro", Name="Hydro", Share=0.18, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=50 },
                    new Technology{ Id="solar", Name="Solar", Share=0.14, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=55 },
                    new Technology{ Id="wind", Name="Wind", Share=0.09, EmissionFactor_tCO2_per_MWh=0.01, ImportTonsPerMWh=0, UnitCostUsdPerMWh=60 },
                    new Technology{ Id="bio", Name="Bioenergy", Share=0.07, EmissionFactor_tCO2_per_MWh=0.02, ImportTonsPerMWh=0, UnitCostUsdPerMWh=70 },
                    new Technology{ Id="coal", Name="Coal", Share=0.04, EmissionFactor_tCO2_per_MWh=0.9, ImportTonsPerMWh=0.4, UnitCostUsdPerMWh=40, ImportResource="Coal" },
                }
            },
        };


        public static Country? Find(string id) => Countries.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));


        public static readonly Dictionary<string, Technology> TechCatalog = new()
        {
            ["hydro"] = new Technology { Id = "hydro", Name = "Hydro", EmissionFactor_tCO2_per_MWh = 0.01, UnitCostUsdPerMWh = 50, ImportTonsPerMWh = 0 },
            ["nuclear"] = new Technology { Id = "nuclear", Name = "Nuclear", EmissionFactor_tCO2_per_MWh = 0.01, UnitCostUsdPerMWh = 60, ImportTonsPerMWh = 0 },
            ["wind"] = new Technology { Id = "wind", Name = "Wind", EmissionFactor_tCO2_per_MWh = 0.01, UnitCostUsdPerMWh = 60, ImportTonsPerMWh = 0 },
            ["solar"] = new Technology { Id = "solar", Name = "Solar", EmissionFactor_tCO2_per_MWh = 0.02, UnitCostUsdPerMWh = 55, ImportTonsPerMWh = 0 },
            ["bio"] = new Technology { Id = "bio", Name = "Bioenergy", EmissionFactor_tCO2_per_MWh = 0.02, UnitCostUsdPerMWh = 70, ImportTonsPerMWh = 0 },
            ["gas"] = new Technology { Id = "gas", Name = "Gas", EmissionFactor_tCO2_per_MWh = 0.5, UnitCostUsdPerMWh = 50, ImportTonsPerMWh = 0.2, ImportResource = "Gas" },
            ["oil"] = new Technology { Id = "oil", Name = "Oil", EmissionFactor_tCO2_per_MWh = 0.7, UnitCostUsdPerMWh = 80, ImportTonsPerMWh = 0.3, ImportResource = "Oil" },
            ["coal"] = new Technology { Id = "coal", Name = "Coal", EmissionFactor_tCO2_per_MWh = 0.9, UnitCostUsdPerMWh = 40, ImportTonsPerMWh = 0.4, ImportResource = "Coal" },
        };
    }
}