using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EnergyProphet.Api.Models;

namespace EnergyProphet.Api.Services
{
    public class AIService : IAIService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _groqApiKey;
        private readonly string _groqModelName;
        private readonly string _groqBaseUrl;
        private readonly int _maxNewTokens;
        private readonly double _temperature;
        private readonly double _topP;

        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public AIService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory =
                httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));

            _groqApiKey =
                configuration["GROQ_API_KEY"] ?? throw new ArgumentNullException("GROQ_API_KEY");
            _groqModelName = configuration["GROQ_MODEL"] ?? "llama-3.1-8b-instant";
            _groqBaseUrl = configuration["GROQ_BASE_URL"] ?? "https://api.groq.com";

            _maxNewTokens = int.TryParse(configuration["AI_MAX_OUTPUT_TOKENS"], out var m)
                ? Math.Clamp(m, 16, 20000)
                : 2048;

            _temperature = double.TryParse(configuration["AI_TEMPERATURE"], out var t)
                ? Math.Clamp(t, 0.0, 2.0)
                : 0.2;

            _topP = double.TryParse(configuration["AI_TOP_P"], out var p)
                ? Math.Clamp(p, 0.0, 1.0)
                : 0.95;
        }

        // -----------------------------------------------------
        //       MAIN ENTRY POINT
        // -----------------------------------------------------
        public async Task<AnalysisResultDto> AnalyzeScenarioAsync(
            Country country,
            IEnumerable<UserChangeDto> userChoices,
            CancellationToken ct = default
        )
        {
            if (country == null)
                throw new ArgumentNullException(nameof(country));
            if (userChoices == null)
                throw new ArgumentNullException(nameof(userChoices));

            var enrichedChanges = BuildChanges(country, userChoices);
            var totalTWh = Convert.ToInt64(enrichedChanges.Sum(e => Math.Round(e.NewTWh, 0)));

            var summary = new AnalysisSummaryDto
            {
                RequestedAtUtc = DateTime.UtcNow,
                CountryId = country.Id,
                CountryName = country.Name ?? country.Id,
                CountryTotalGenerationTWh = Convert.ToDouble(totalTWh),
                Changes = enrichedChanges,
                Warnings = new List<string>(),
            };

            var prompt = ScenarioPromptBuilder.BuildPrompt(country, summary);

            // Errors are caught here and stored as warnings — never as raw text in AnalysisText
            string aiText;
            try
            {
                aiText = await CallGroqAsync(prompt, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AIService] AI call failed: {ex.Message}");
                summary.Warnings.Add(
                    "AI analysis is temporarily unavailable. Please try again later."
                );
                aiText = string.Empty;
            }

            return new AnalysisResultDto { Summary = summary, AnalysisText = aiText };
        }

        // -----------------------------------------------------
        //       CHANGE PROCESSING
        // -----------------------------------------------------
        private List<EnrichedChangeDto> BuildChanges(
            Country country,
            IEnumerable<UserChangeDto> choices
        )
        {
            var output = new List<EnrichedChangeDto>();
            var techMap =
                country.Technologies?.ToDictionary(t => t.Id)
                ?? new Dictionary<string, Technology>();

            foreach (var ch in choices)
            {
                if (string.IsNullOrWhiteSpace(ch.Id))
                    continue;

                techMap.TryGetValue(ch.Id, out var tech);

                var prevTWh = TryGetDoubleProperty(ch, "PrevTWh") ?? 0;
                var newTWh = TryGetDoubleProperty(ch, "NewTWh") ?? prevTWh;

                long prevInt = Convert.ToInt64(Math.Round(prevTWh));
                long newInt = Convert.ToInt64(Math.Round(newTWh));
                long delta = newInt - prevInt;

                var (ef, unit) = GetEmissionFactor(tech);
                var deltaCo2 = CalculateDeltaCo2Tonnes(delta, ef, unit);

                output.Add(
                    new EnrichedChangeDto
                    {
                        Id = ch.Id,
                        Name = tech?.Name ?? ch.Id,
                        PrevTWh = prevInt,
                        NewTWh = newInt,
                        DeltaTWh = delta,
                        EmissionFactor = ef,
                        EmissionFactorUnit = unit.ToString(),
                        DeltaCo2Tonnes = deltaCo2.HasValue
                            ? Convert.ToDouble(Math.Round(deltaCo2.Value))
                            : null,
                    }
                );
            }

            return output;
        }

        // -----------------------------------------------------
        //       GROQ API CALL (OpenAI-compatible format)
        // -----------------------------------------------------
        private async Task<string> CallGroqAsync(string prompt, CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                _groqApiKey
            );
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
            client.DefaultRequestHeaders.UserAgent.ParseAdd("energy-prophet/1.0");

            var url = $"{_groqBaseUrl.TrimEnd('/')}/openai/v1/chat/completions";

            var payload = new
            {
                model = _groqModelName,
                messages = new[] { new { role = "user", content = prompt } },
                max_tokens = _maxNewTokens,
                temperature = _temperature,
                top_p = _topP,
            };

            var bodyJson = JsonSerializer.Serialize(payload, JsonOptions);
            using var content = new StringContent(bodyJson, Encoding.UTF8, "application/json");

            using var resp = await client.PostAsync(url, content, ct);
            var raw = await resp.Content.ReadAsStringAsync(ct);

            // HTTP-level errors → throw so the caller can handle them cleanly
            if (!resp.IsSuccessStatusCode)
            {
                Console.WriteLine($"[AIService] Groq API error {resp.StatusCode}: {raw}");
                throw new HttpRequestException(
                    $"Groq API returned {(int)resp.StatusCode} {resp.StatusCode}"
                );
            }

            // Parse the OpenAI-compatible response
            try
            {
                using var doc = JsonDocument.Parse(raw);

                if (doc.RootElement.TryGetProperty("error", out var err))
                {
                    var msg = err.TryGetProperty("message", out var m) ? m.GetString() : raw;
                    Console.WriteLine($"[AIService] Groq API error body: {msg}");
                    throw new InvalidOperationException($"Groq API error: {msg}");
                }

                var text = ExtractGroqText(doc.RootElement);
                if (string.IsNullOrWhiteSpace(text))
                    throw new InvalidOperationException("Groq returned an empty response.");

                return text;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"[AIService] Failed to parse Groq response JSON: {ex.Message}");
                throw new InvalidOperationException("Could not parse Groq response.", ex);
            }
        }

        // -----------------------------------------------------
        //       GROQ TEXT EXTRACTOR (OpenAI format)
        //       choices[0].message.content
        // -----------------------------------------------------
        private static string ExtractGroqText(JsonElement root)
        {
            if (
                root.TryGetProperty("choices", out var choices)
                && choices.ValueKind == JsonValueKind.Array
                && choices.GetArrayLength() > 0
                && choices[0].TryGetProperty("message", out var message)
                && message.TryGetProperty("content", out var contentEl)
            )
            {
                return contentEl.GetString() ?? string.Empty;
            }

            return string.Empty;
        }

        // -----------------------------------------------------
        //    EMISSION CALCULATION HELPERS
        // -----------------------------------------------------
        private enum EmissionUnit
        {
            Unknown,
            KgPerMWh,
            TonnesPerMWh,
        }

        private (double? value, EmissionUnit unit) GetEmissionFactor(object? tech)
        {
            if (tech == null)
                return (null, EmissionUnit.Unknown);

            try
            {
                var props = tech.GetType().GetProperties();

                foreach (var p in props)
                {
                    var name = p.Name.ToLowerInvariant();
                    if (!name.Contains("co2") && !name.Contains("emission"))
                        continue;

                    if (
                        double.TryParse(
                            Convert.ToString(p.GetValue(tech), CultureInfo.InvariantCulture),
                            NumberStyles.Any,
                            CultureInfo.InvariantCulture,
                            out double val
                        )
                    )
                    {
                        if (name.Contains("kg"))
                            return (val, EmissionUnit.KgPerMWh);
                        if (name.Contains("t") || name.Contains("ton"))
                            return (val, EmissionUnit.TonnesPerMWh);

                        // Guess by magnitude
                        return Math.Abs(val) > 10
                            ? (val, EmissionUnit.KgPerMWh)
                            : (val, EmissionUnit.TonnesPerMWh);
                    }
                }
            }
            catch { }

            return (null, EmissionUnit.Unknown);
        }

        private double? CalculateDeltaCo2Tonnes(long deltaTWh, double? ef, EmissionUnit unit)
        {
            if (!ef.HasValue)
                return null;
            if (unit == EmissionUnit.Unknown)
                return null;

            var mwh = deltaTWh * 1_000_000.0;

            return unit switch
            {
                EmissionUnit.KgPerMWh => mwh * ef.Value / 1000.0,
                EmissionUnit.TonnesPerMWh => mwh * ef.Value,
                _ => null,
            };
        }

        // -----------------------------------------------------
        //       REFLECTION HELPERS
        // -----------------------------------------------------
        private double? TryGetDoubleProperty(object obj, string name)
        {
            var p = obj.GetType()
                .GetProperty(
                    name,
                    System.Reflection.BindingFlags.IgnoreCase
                        | System.Reflection.BindingFlags.Public
                        | System.Reflection.BindingFlags.Instance
                );

            if (p?.GetValue(obj) is not object val)
                return null;

            return double.TryParse(
                Convert.ToString(val, CultureInfo.InvariantCulture),
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out var d
            )
                ? d
                : null;
        }
    }
}
