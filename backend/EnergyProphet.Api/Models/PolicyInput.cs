namespace EnergySim.Api.Models;


public class PolicyInput
{
public string CountryCode { get; set; } = "CH";
public int StartYear { get; set; } = 2025;
public int EndYear { get; set; } = 2050;


// Croissance annuelle de la demande (ex: 0.005 = +0.5%)
public double DemandGrowth { get; set; } = 0.003;
// Gains d'efficacité (soustraits à la croissance) (ex: 0.004 = -0.4%)
public double EfficiencyGain { get; set; } = 0.004;
// Électrification (ajout à la croissance) (ex: 0.003 = +0.3%)
public double ElectrificationPush { get; set; } = 0.003;


// Année d'arrêt du nucléaire (null = pas d'arrêt forcé)
public int? NuclearPhaseOutYear { get; set; } = null;


// Cibles de parts de production en 2050 (0..1). Les clés manquantes seront déduites/renormalisées.
public Dictionary<Technology, double> TargetShares2050 { get; set; } = new();
}