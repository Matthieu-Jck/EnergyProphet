namespace EnergySim.Api.Models;


public class Technology
{
    // an identifier like "coal", "solar", "wind", "nuclear"
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;


    // Current share of generation (0..1). Shares should sum approximately to 1.0
    public double Share { get; set; }


    // Emissions in tCO2 per MWh (for electricity)
    public double EmissionFactor_tCO2_per_MWh { get; set; }


    // Fuel import dependency per MWh (tons of primary fuel per MWh) for simplicity
    public double ImportTonsPerMWh { get; set; }


    // Unit generation cost estimate in USD per MWh
    public double UnitCostUsdPerMWh { get; set; }


    // If this technology requires a specific import resource, name it (e.g. "Coal", "Uranium", "Gas")
    public string? ImportResource { get; set; }
}