using Microsoft.AspNetCore.Mvc;
using EnergyProphet.Api.Models;
using EnergyProphet.Api.Services;

[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly IDataRepository _repo;
    private readonly IAIService _ai;

    public CountriesController(IDataRepository repo, IAIService ai)
    {
        _repo = repo;
        _ai = ai;
    }

    [HttpGet] // GET /api/countries
    public async Task<ActionResult<IEnumerable<Country>>> GetCountries()
    {
        var countries = await _repo.GetCountriesAsync();
        return Ok(countries);
    }

    [HttpGet("{id}")] // GET /api/countries/{id}
    public async Task<ActionResult<Country>> GetCountry(string id)
    {
        var country = await _repo.GetCountryAsync(id);
        if (country == null) return NotFound();
        return Ok(country);
    }

}
