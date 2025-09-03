using EnergyProphet.Api.Models;


namespace EnergyProphet.Api.Services;


public class SimulationService : ISimulationService
{
    private readonly IDataRepository _repo;
    private const double DefaultAnnualGrowth = 0.01; // 1%/year baseline assumption


    public SimulationService(IDataRepository repo)
    {
        _repo = repo;
    }


    public async Task<SimulationResult> SimulateAsync(PolicyInput input, CancellationToken ct = default)
    {
        var country = await _repo.GetCountryAsync(input.CountryId, ct);
        if (country is null)
            throw new ArgumentException($"Unknown country id: {input.CountryId}");


        var targetYear = input.TargetYear > 0 ? input.TargetYear : 2050;
        var currentYear = DateTime.UtcNow.Year;
        var years = Math.Max(1, targetYear - currentYear);


        var totalGenerationTarget = ProjectGeneration(country.TotalGenerationTWh, years);
        var targetShares = NormalizeShares(input.TargetShares, country);


        var projectedGen = ComputeGenerationPerTech(country, targetShares, totalGenerationTarget);
        var (totalCO2_Mt, totalCost_BUSD, imports) = ComputeAggregates(country, projectedGen);


        return new SimulationResult
        {
            CountryId = country.Id,
            TargetYear = targetYear,
            ProjectedGenerationTWh = projectedGen,
            TotalCO2Emissions_Mt = totalCO2_Mt,
            TotalCost_BillionUSD = totalCost_BUSD,
            ProjectedImportsTons = imports
        };
    }


    private static double ProjectGeneration(double baseTWh, int years)
    {
        return baseTWh * Math.Pow(1 + DefaultAnnualGrowth, years);
    }


    private static Dictionary<string, double> ComputeGenerationPerTech(Country country, Dictionary<string, double> shares, double totalTWh)
    {
        return country.Technologies.ToDictionary(
        t => t.Id,
        t => totalTWh * (shares.TryGetValue(t.Id, out var s) ? s : 0.0)
        );
    }


    private static (double co2_Mt, double cost_BUSD, Dictionary<string, double> imports) ComputeAggregates(Country country, Dictionary<string, double> gen)
    {
        double co2_tonnes = 0;
        double costUsd = 0;
        var imports = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);


        foreach (var t in country.Technologies)
        {
            if (!gen.TryGetValue(t.Id, out var twh) || twh <= 0) continue;


            var mwh = twh * 1_000_000.0;


            co2_tonnes += mwh * t.EmissionFactor_tCO2_per_MWh;
            costUsd += mwh * t.UnitCostUsdPerMWh;


            if (!string.IsNullOrEmpty(t.ImportResource) && t.ImportTonsPerMWh > 0)
            {
                var tons = mwh * t.ImportTonsPerMWh;
                imports[t.ImportResource!] = imports.GetValueOrDefault(t.ImportResource!, 0) + tons;
            }
        }

        return (
        Math.Round(co2_tonnes / 1_000_000.0, 3),
        Math.Round(costUsd / 1_000_000_000.0, 3),
        imports
        );
    }

    private static Dictionary<string, double> NormalizeShares(Dictionary<string, double> inputShares, Country country)
    {
        // Initialize a dictionary with all country technologies set to 0
        var normalizedShares = country.Technologies.ToDictionary(
            t => t.Id,
            t => 0.0,
            StringComparer.OrdinalIgnoreCase
        );

        // Copy input shares, ensuring non-negative values
        foreach (var share in inputShares)
        {
            if (normalizedShares.ContainsKey(share.Key))
            {
                normalizedShares[share.Key] = Math.Max(0, share.Value); // Ensure non-negative
            }
        }

        // Calculate the sum of shares
        double totalShare = normalizedShares.Values.Sum();

        // If totalShare is 0, distribute shares equally
        if (totalShare == 0)
        {
            double equalShare = 1.0 / normalizedShares.Count;
            foreach (var key in normalizedShares.Keys.ToList())
            {
                normalizedShares[key] = equalShare;
            }
        }
        // Otherwise, normalize to sum to 1.0
        else
        {
            foreach (var key in normalizedShares.Keys.ToList())
            {
                normalizedShares[key] /= totalShare;
            }
        }

        return normalizedShares;
    }
}