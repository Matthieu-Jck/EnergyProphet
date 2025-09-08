using EnergyProphet.Api.Models;

namespace EnergyProphet.Api.Services
{
    public interface IAIService
    {
        Task<string> AnalyzeScenarioAsync(Country country, object userChoices, CancellationToken ct = default);
    }
}
