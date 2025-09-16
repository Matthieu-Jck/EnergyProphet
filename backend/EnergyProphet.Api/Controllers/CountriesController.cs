using Microsoft.AspNetCore.Mvc;
using EnergyProphet.Api.Models;
using EnergyProphet.Api.Services;
using Microsoft.AspNetCore.Cors;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowFrontend")]
public class CountriesController : ControllerBase
{
    private readonly IDataRepository _repo;

    public CountriesController(IDataRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Country>>> GetCountries([FromServices] ILogger<CountriesController> logger)
    {
        try
        {
            var countries = await _repo.GetCountriesAsync();
            return Ok(countries);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching countries");
            return StatusCode(500, "Internal server error");
        }
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Country>> GetCountry(string id, [FromServices] ILogger<CountriesController> logger)
    {
        try
        {
            var country = await _repo.GetCountryAsync(id);
            if (country == null) return NotFound();
            return Ok(country);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching country {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
