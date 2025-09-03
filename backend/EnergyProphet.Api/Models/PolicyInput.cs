namespace EnergySim.Api.Models;


public class PolicyInput
{
    // Country id
    public string CountryId { get; set; } = null!;


    // Map technology id -> desired share in 2050 (values 0..1). The server will normalize if needed.
    public Dictionary<string, double> TargetShares { get; set; } = new();


    // Target year (default 2050)
    public int TargetYear { get; set; } = 2050;
}