using EnergyProphet.Api.Models;


namespace EnergyProphet.Api.Services;


public interface ISimulationService
{
    Task<SimulationResult> SimulateAsync(PolicyInput input, CancellationToken ct = default);
}