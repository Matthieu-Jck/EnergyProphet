using EnergySim.Api.Models;


namespace EnergySim.Api.Services;


public class DataRepository
{
    public IReadOnlyList<Country> Countries { get; } = new List<Country>
{
new("CH", "Suisse"),
new("FR", "France")
};
    public YearMix GetCurrentFor(string countryCode)
    {
        if (countryCode != "CH") throw new ArgumentException("Pays non pris en charge pour la démo");

        return new YearMix
        {
            Year = 2023,
            DemandTWh = 60.0,
            GenerationTWh = new Dictionary<Technology, double>
            {
                [Technology.Hydro] = 33.0,
                [Technology.Nuclear] = 20.0,
                [Technology.Solar] = 3.0,
                [Technology.Wind] = 1.0,
                [Technology.Fossil] = 1.0,
                [Technology.Biomass] = 1.0,
                [Technology.Geothermal] = 0.0,
                [Technology.Imports] = 1.0
            },
            EmissionsMtCO2 = 0.0 // recalculé côté service si besoin
        };
    }
}