using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EnergyProphet.Api.Models;
using EnergyProphet.Api.Services;

public class AIService : IAIService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _hfToken;

    public AIService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _hfToken = configuration["HF_TOKEN"] ?? throw new ArgumentNullException("HF_TOKEN must be configured.");
    }

    public async Task<string> AnalyzeScenarioAsync(Country country, object userChoices, CancellationToken ct = default)
    {
        var prompt = ScenarioPromptBuilder.BuildPrompt(country, userChoices);

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _hfToken);

        var payload = new
        {
            inputs = prompt
        };

        var response = await client.PostAsync(
            "https://api-inference.huggingface.co/models/moonshotai/Kimi-K2-Instruct",
            new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"),
            ct
        );

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement[0].GetProperty("generated_text").GetString() ?? "";
    }
}


public class ScenarioPromptBuilder
{
    public static string BuildPrompt(Country country, object userChoices)
    {
        var countryJson = JsonSerializer.Serialize(country, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        var choicesJson = JsonSerializer.Serialize(userChoices, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        return $@"
                You are an energy policy and power systems expert. 
                Your task is to analyze electricity generation scenarios for 2050.

                Here is the current data for the country:
                {countryJson}

                The user has proposed the following changes for 2050:
                {choicesJson}

                Please provide a structured analysis with:

                1. **Feasibility**: Geographic, environmental, technical constraints  
                (e.g. water for hydro, solar exposure, intermittency, nuclear expansion, import dependencies).  

                2. **Cost implications**: Estimate based on UnitCostUsdPerMWh, compare to original scenario.  

                3. **Emissions impact**: CO₂ emissions vs. original, using emission factors.  

                4. **Energy security & variability**: Import reliance + grid stability (baseload vs. variable).  

                5. **Neutral recommendation**: Stay factual, neutral, but highlight efficient & low-carbon sources.  

                Present your answer in clear **sections with bullet points**.
                ";
    }
}
