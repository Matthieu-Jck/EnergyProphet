using Microsoft.AspNetCore.Mvc;
using EnergyProphet.Api.Services;

namespace EnergyProphet.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScenarioController : ControllerBase
    {
        private readonly IAService _iaService;

        public ScenarioController(IAService iaService)
        {
            _iaService = iaService;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> Analyze([FromBody] object userScenario)
        {
            // Appel au service IA
            var analysis = await _iaService.AnalyzeUserScenarioAsync(userScenario);
            return Ok(new { analysis });
        }
    }
}
