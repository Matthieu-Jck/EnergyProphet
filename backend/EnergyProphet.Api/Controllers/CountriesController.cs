using Microsoft.AspNetCore.Mvc;
using EnergySim.Api.Services;
using EnergySim.Api.Models;


namespace EnergySim.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly IRepository _repo;


    public CountriesController(IRepository repo)
    {
        _repo = repo;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Country>>> GetCountries(CancellationToken ct)
    {
        var countries = await _repo.GetCountriesAsync(ct);
        return Ok(countries);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Country>> GetCountry(string id, CancellationToken ct)
    {
        var country = await _repo.GetCountryAsync(id, ct);
        if (country is null)
            return NotFound();
        return Ok(country);
    }
}