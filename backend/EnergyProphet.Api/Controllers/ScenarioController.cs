using EnergyProphet.Api.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ScenarioController : ControllerBase
{
    private readonly IDataRepository _dataRepository;
    private readonly IAIService _aiService;

    public ScenarioController(IDataRepository dataRepository, IAIService aiService)
    {
        _dataRepository = dataRepository;
        _aiService = aiService;
    }

    [HttpPost("{id}/analyze")]
    public async Task<IActionResult> AnalyzeScenario(string id, [FromBody] object userChoices, CancellationToken ct)
    {
        var country = await _dataRepository.GetCountryAsync(id, ct);
        if (country == null)
            return NotFound();

        var analysis = await _aiService.AnalyzeScenarioAsync(country, userChoices, ct);
        return Ok(analysis);
    }
}