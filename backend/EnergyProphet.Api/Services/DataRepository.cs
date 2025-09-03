using System.Text.Json;
using EnergySim.Api.Models;


namespace EnergySim.Api.Services;


public class DataRepository : IRepository
{
    private readonly IReadOnlyList<Country> _countries;


    public DataRepository()
    {
        _countries = LoadCountries();
    }


    private static IReadOnlyList<Country> LoadCountries()
    {
        // Resolve potential data file locations
        var basePaths = new[]
        {
Path.Combine(AppContext.BaseDirectory, "data", "countries.json"),
Path.Combine(Directory.GetCurrentDirectory(), "data", "countries.json")
};


        foreach (var path in basePaths)
        {
            if (File.Exists(path))
            {
                try
                {
                    var json = File.ReadAllText(path);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var list = JsonSerializer.Deserialize<List<Country>>(json, options);
                    if (list is not null && list.Count > 0)
                    {
                        return list;
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Failed to load countries from {path}: {ex.Message}");
                }
            }
        }


        // Fallback: minimal default country to keep API usable
        return new List<Country>
{
new Country
{
Id = "test-land",
Name = "Testland",
TotalGenerationTWh = 100,
Technologies = new List<Technology>
{
new Technology { Id = "coal", Name = "Coal", Share = 0.4, EmissionFactor_tCO2_per_MWh = 1.0, ImportTonsPerMWh = 0.5, UnitCostUsdPerMWh = 40, ImportResource = "Coal" },
new Technology { Id = "gas", Name = "Gas", Share = 0.3, EmissionFactor_tCO2_per_MWh = 0.5, ImportTonsPerMWh = 0.2, UnitCostUsdPerMWh = 50, ImportResource = "Gas" },
new Technology { Id = "wind", Name = "Wind", Share = 0.2, EmissionFactor_tCO2_per_MWh = 0.01, ImportTonsPerMWh = 0, UnitCostUsdPerMWh = 60 },
new Technology { Id = "solar", Name = "Solar", Share = 0.1, EmissionFactor_tCO2_per_MWh = 0.02, ImportTonsPerMWh = 0, UnitCostUsdPerMWh = 55 }
}
}
};
    }


    public Task<IEnumerable<Country>> GetCountriesAsync(CancellationToken ct = default)
    => Task.FromResult<IEnumerable<Country>>(_countries);


    public Task<Country?> GetCountryAsync(string id, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(id))
            return Task.FromResult<Country?>(null);


        var country = _countries.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(country);
    }
}