namespace EnergySim.Api.Models;


public class SimulationResult
{
public Country Country { get; set; } = new("CH", "Suisse");
public List<YearMix> Years { get; set; } = new();


public double TotalEmissionsMtCO2 => Years.Sum(y => y.EmissionsMtCO2);
public double PeakDemandTWh => Years.Max(y => y.DemandTWh);
public double LastYearEmissionsMtCO2 => Years.LastOrDefault()?.EmissionsMtCO2 ?? 0;
}