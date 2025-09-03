using Microsoft.AspNetCore.Mvc;
using EnergyProphet.Api.Services;
using EnergyProphet.Api.Models;


namespace EnergyProphet.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly ISimulationService _service;


    public SimulationController(ISimulationService service)
    {
        _service = service;
    }


    [HttpPost]
    public async Task<ActionResult<SimulationResult>> Simulate([FromBody] PolicyInput input, CancellationToken ct)
    {
        if (input is null)
            return BadRequest("Invalid policy input");


        try
        {
            var result = await _service.SimulateAsync(input, ct);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }
}