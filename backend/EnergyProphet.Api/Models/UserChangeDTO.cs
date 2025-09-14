namespace EnergyProphet.Api.Models
{
    public class UserChangeDto
    {
        public string Id { get; set; } = string.Empty;
        public double? PrevShare { get; set; } // 0..1
        public double? PrevTWh { get; set; }
        public double NewShare { get; set; } // 0..1
        public double NewTWh { get; set; }
    }
}