namespace EnergyProphet.Api.Models
{
    public class AnalysisResultDto
    {
        public AnalysisSummaryDto Summary { get; set; } = new();
        public string AnalysisText { get; set; } = string.Empty;
    }
}
