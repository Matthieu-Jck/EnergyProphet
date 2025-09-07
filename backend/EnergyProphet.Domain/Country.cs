using System.Text.Json.Serialization;


namespace EnergyProphet.Api.Models;


public class Country
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;


    // Current total generation in TWh (typical yearly electricity generation)
    public double TotalGenerationTWh { get; set; }


    // Technologies present in the country
    public List<Technology> Technologies { get; set; } = new();
}