using EnergyProphet.Api.Models;

namespace EnergyProphet.Api.Services;

public interface IDataRepository
{
    Task<IEnumerable<Country>> GetCountriesAsync(CancellationToken ct = default);
    Task<Country?> GetCountryAsync(string id, CancellationToken ct = default);
}