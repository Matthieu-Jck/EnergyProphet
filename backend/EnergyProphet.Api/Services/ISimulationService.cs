using EnergySim.Api.Models;


namespace EnergySim.Api.Services;


public interface ISimulationService
{
    Task<SimulationResult> SimulateAsync(PolicyInput input, CancellationToken ct = default);
}