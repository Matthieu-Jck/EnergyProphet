namespace EnergySim.Api.Models;


public class YearMix
{
public int Year { get; set; }
public double DemandTWh { get; set; }
public Dictionary<Technology, double> GenerationTWh { get; set; } = new();
public double EmissionsMtCO2 { get; set; }
}