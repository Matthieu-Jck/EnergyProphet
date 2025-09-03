namespace EnergySim.Api.Models;


public class SimulationResult
{
    public string CountryId { get; set; } = null!;
    public int TargetYear { get; set; }


    // Projected generation per-technology in TWh
    public Dictionary<string, double> ProjectedGenerationTWh { get; set; } = new();


    // Total projected CO2 emissions in million tonnes (MtCO2)
    public double TotalCO2Emissions_Mt { get; set; }


    // Total projected annual cost in billion USD
    public double TotalCost_BillionUSD { get; set; }


    // Imports grouped by resource type (tons)
    public Dictionary<string, double> ProjectedImportsTons { get; set; } = new();
}