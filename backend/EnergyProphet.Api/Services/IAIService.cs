using EnergyProphet.Api.Models;

public interface IAIService
{
    Task<AnalysisResultDto> AnalyzeScenarioAsync(
        Country country,
        IEnumerable<UserChangeDto> userChoices,
        CancellationToken ct = default
    );
}
