using Microsoft.AspNetCore.Mvc;
using EnergyProphet.Api.Services;

namespace EnergyProphet.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScenarioController : ControllerBase
    {
        private readonly IAIService _aiService;

        public ScenarioController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> Analyze([FromBody] object userScenario)
        {
            // Appel au service IA
            var analysis = await _aiService.AnalyzeScenarioAsync(userScenario);
            return Ok(new { analysis });
        }
    }
}
