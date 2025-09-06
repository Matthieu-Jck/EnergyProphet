using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace EnergyProphet.Api.Services
{
    public class AIService : IAIService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string? _hfToken;

        public AIService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _hfToken = configuration["HF_TOKEN"] ?? throw new ArgumentNullException("HF_TOKEN must be configured.");
        }

        public async Task<string> AnalyzeScenarioAsync(object userScenario)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _hfToken);

            var payload = new
            {
                inputs = JsonSerializer.Serialize(userScenario)
            };

            var response = await client.PostAsync(
                "https://api-inference.huggingface.co/models/moonshotai/Kimi-K2-Instruct",
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            );

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement[0].GetProperty("generated_text").GetString() ?? "";
        }
    }
}