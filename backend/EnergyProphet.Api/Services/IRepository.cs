using EnergySim.Api.Models;


namespace EnergySim.Api.Services;


public interface IRepository
{
    Task<IEnumerable<Country>> GetCountriesAsync(CancellationToken ct = default);
    Task<Country?> GetCountryAsync(string id, CancellationToken ct = default);
}