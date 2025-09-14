namespace EnergyProphet.Api.Models
{
    public class AnalysisSummaryDto
    {
        public DateTime RequestedAtUtc { get; set; }

        public string CountryId { get; set; } = null!;
        public string CountryName { get; set; } = null!;

        public double CountryTotalGenerationTWh { get; set; }

        public List<EnrichedChangeDto> Changes { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }
}
