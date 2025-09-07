namespace EnergyProphet.Api.Models;


public class Technology
{
    // an identifier like "coal", "solar", "wind", "nuclear"
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public double Share { get; set; }
    public double EmissionFactor_tCO2_per_MWh { get; set; }
    public double ImportTonsPerMWh { get; set; }    public double UnitCostUsdPerMWh { get; set; }
    public string? ImportResource { get; set; }
}