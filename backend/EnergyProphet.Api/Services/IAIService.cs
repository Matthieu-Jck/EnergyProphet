namespace EnergyProphet.Api.Services
{
    public interface IAIService
    {
        Task<string> AnalyzeScenarioAsync(object userScenario);
    }
}
