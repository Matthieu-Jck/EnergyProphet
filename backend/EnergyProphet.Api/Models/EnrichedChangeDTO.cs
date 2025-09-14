namespace EnergyProphet.Api.Models
{
    public class EnrichedChangeDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;

        public double PrevShare { get; set; }
        public double PrevTWh { get; set; }
        public double NewShare { get; set; }
        public double NewTWh { get; set; }
        public double DeltaTWh { get; set; }
        public double? EmissionFactor { get; set; }
        public string? EmissionFactorUnit { get; set; }
        public double? DeltaCo2Tonnes { get; set; }
    }
}
