using System.Text.Json;
using EnergyProphet.Api.Models;
using EnergyProphet.Api.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/countries")]
public class ScenarioController : ControllerBase
{
    private readonly IDataRepository _repo;
    private readonly IAIService _aiService;
    private readonly ILogger<ScenarioController> _logger;

    public ScenarioController(IDataRepository repo, IAIService aiService, ILogger<ScenarioController> logger)
    {
        _repo = repo;
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost("{id}/analysis")]
    public async Task<IActionResult> AnalyzeCountryScenario(
        [FromRoute] string id,
        [FromBody] IEnumerable<UserChangeDto>? changes,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest(new { message = "Country id is required." });

        if (changes == null || !changes.Any())
            return BadRequest(new { message = "At least one change must be provided." });

        var country = await _repo.GetCountryAsync(id, ct);
        if (country == null)
            return NotFound(new { message = $"Country '{id}' not found." });

        try
        {
            _logger.LogInformation(
                "Starting analysis for country {CountryId} with {ChangeCount} changes",
                id, changes.Count());

            _logger.LogDebug("Incoming changes: {Changes}", JsonSerializer.Serialize(changes));

            var result = await _aiService.AnalyzeScenarioAsync(country, changes, ct);

            if (string.IsNullOrWhiteSpace(result.AnalysisText))
            {
                _logger.LogWarning("AI analysis returned an EMPTY response for country {CountryId}", id);
            }
            else
            {
                var preview = result.AnalysisText.Length > 2000
                    ? result.AnalysisText.Substring(0, 2000) + "...(truncated)"
                    : result.AnalysisText;

                _logger.LogDebug("AI analysis result for {CountryId}: {AnalysisText}", id, preview);
            }

            _logger.LogInformation("Completed analysis for country {CountryId}", id);

            return Ok(result);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Analysis cancelled for country {CountryId}", id);
            return StatusCode(499, new { message = "Request cancelled." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze scenario for country {CountryId}", id);
            return Problem(detail: "AI analysis failed. See server logs for details.", statusCode: 500);
        }
    }
}