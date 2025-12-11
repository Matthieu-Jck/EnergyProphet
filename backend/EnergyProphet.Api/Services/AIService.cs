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
        private readonly string _googleApiKey;
        private readonly string _googleModelName;
        private readonly string _googleBaseUrl;
        private readonly int _maxNewTokens;
        private readonly double _temperature;
        private readonly double _topP;

        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public AIService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));

            _googleApiKey    = configuration["GOOGLE_API_KEY"]  ?? throw new ArgumentNullException("GOOGLE_API_KEY");
            _googleModelName = configuration["GOOGLE_MODEL"]     ?? "gemini-2.0-flash";
            _googleBaseUrl   = configuration["GOOGLE_BASE_URL"]  ?? "https://generativelanguage.googleapis.com";

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
            CancellationToken ct = default)
        {
            if (country == null) throw new ArgumentNullException(nameof(country));
            if (userChoices == null) throw new ArgumentNullException(nameof(userChoices));

            var enrichedChanges = BuildChanges(country, userChoices);
            var totalTWh = Convert.ToInt64(enrichedChanges.Sum(e => Math.Round(e.NewTWh, 0)));

            var summary = new AnalysisSummaryDto
            {
                RequestedAtUtc = DateTime.UtcNow,
                CountryId = country.Id,
                CountryName = country.Name ?? country.Id,
                CountryTotalGenerationTWh = Convert.ToDouble(totalTWh),
                Changes = enrichedChanges,
                Warnings = new List<string>()
            };

            var prompt = ScenarioPromptBuilder.BuildPrompt(country, summary);
            var aiText = await CallGoogleAsync(prompt, ct);

            return new AnalysisResultDto
            {
                Summary = summary,
                AnalysisText = aiText
            };
        }

        // -----------------------------------------------------
        //       CHANGE PROCESSING
        // -----------------------------------------------------
        private List<EnrichedChangeDto> BuildChanges(
            Country country,
            IEnumerable<UserChangeDto> choices)
        {
            var output = new List<EnrichedChangeDto>();
            var techMap = country.Technologies?.ToDictionary(t => t.Id) ?? new Dictionary<string, Technology>();

            foreach (var ch in choices)
            {
                if (string.IsNullOrWhiteSpace(ch.Id))
                    continue;

                techMap.TryGetValue(ch.Id, out var tech);

                var prevTWh = TryGetDoubleProperty(ch, "PrevTWh") ?? 0;
                var newTWh  = TryGetDoubleProperty(ch, "NewTWh")  ?? prevTWh;

                long prevInt = Convert.ToInt64(Math.Round(prevTWh));
                long newInt  = Convert.ToInt64(Math.Round(newTWh));
                long delta   = newInt - prevInt;

                var (ef, unit) = GetEmissionFactor(tech);
                var deltaCo2 = CalculateDeltaCo2Tonnes(delta, ef, unit);

                output.Add(new EnrichedChangeDto
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
                        : null
                });
            }

            return output;
        }

        // -----------------------------------------------------
        //       GOOGLE API CALL
        // -----------------------------------------------------
        private async Task<string> CallGoogleAsync(string prompt, CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.TryAddWithoutValidation("X-Goog-Api-Key", _googleApiKey);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.UserAgent.ParseAdd("energy-prophet/1.0");

            var url = $"{_googleBaseUrl.TrimEnd('/')}/v1beta/models/{_googleModelName}:generateContent";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = _temperature,
                    topP = _topP,
                    maxOutputTokens = _maxNewTokens,
                    candidateCount = 1
                }
            };

            var bodyJson = JsonSerializer.Serialize(payload, JsonOptions);
            using var content = new StringContent(bodyJson, Encoding.UTF8, "application/json");

            using var resp = await client.PostAsync(url, content, ct);
            var raw = await resp.Content.ReadAsStringAsync(ct);

            // 1. Handle HTTP-Level Errors
            if (!resp.IsSuccessStatusCode)
            {
                Console.WriteLine($"[AIService] Google API error {resp.StatusCode}: {raw}");
                return FriendlyErrorMessage();
            }

            // 2. Handle API JSON-level errors
            try
            {
                using var doc = JsonDocument.Parse(raw);

                if (doc.RootElement.TryGetProperty("error", out var err))
                {
                    Console.WriteLine($"[AIService] Google API returned error JSON: {raw}");
                    return FriendlyErrorMessage();
                }

                var text = ExtractGoogleText(doc.RootElement);
                return string.IsNullOrWhiteSpace(text) ? FriendlyErrorMessage() : text;
            }
            catch
            {
                Console.WriteLine("[AIService] Failed to parse response JSON.");
                return FriendlyErrorMessage();
            }
        }

        // -----------------------------------------------------
        //       SAFE, CLEAN GOOGLE TEXT EXTRACTOR
        // -----------------------------------------------------
        private string ExtractGoogleText(JsonElement root)
        {
            if (root.TryGetProperty("candidates", out var cands) &&
                cands.ValueKind == JsonValueKind.Array &&
                cands.GetArrayLength() > 0)
            {
                var first = cands[0];

                if (first.TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts))
                {
                    var pieces = parts.EnumerateArray()
                        .Select(p =>
                            p.TryGetProperty("text", out var t) ? t.GetString() : null)
                        .Where(x => !string.IsNullOrWhiteSpace(x));

                    return string.Join("", pieces);
                }
            }

            return string.Empty;
        }

        // -----------------------------------------------------
        //       CLEAN ERROR MESSAGE
        // -----------------------------------------------------
        private string FriendlyErrorMessage() =>
            "⚠️ The AI service is temporarily unavailable or has reached a rate limit. " +
            "Please try again later.";

        // -----------------------------------------------------
        //    EMISSION CALCULATION HELPERS
        // -----------------------------------------------------
        private enum EmissionUnit { Unknown, KgPerMWh, TonnesPerMWh }

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
                    if (!name.Contains("co2") && !name.Contains("emission")) continue;

                    if (double.TryParse(Convert.ToString(p.GetValue(tech), CultureInfo.InvariantCulture),
                        NumberStyles.Any, CultureInfo.InvariantCulture, out double val))
                    {
                        if (name.Contains("kg")) return (val, EmissionUnit.KgPerMWh);
                        if (name.Contains("t") || name.Contains("ton")) return (val, EmissionUnit.TonnesPerMWh);

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
            if (!ef.HasValue) return null;
            if (unit == EmissionUnit.Unknown) return null;

            var mwh = deltaTWh * 1_000_000.0;

            return unit switch
            {
                EmissionUnit.KgPerMWh => mwh * ef.Value / 1000.0,
                EmissionUnit.TonnesPerMWh => mwh * ef.Value,
                _ => null
            };
        }

        // -----------------------------------------------------
        //       REFLECTION HELPERS
        // -----------------------------------------------------
        private double? TryGetDoubleProperty(object obj, string name)
        {
            var p = obj.GetType().GetProperty(name,
                System.Reflection.BindingFlags.IgnoreCase |
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.Instance);

            if (p?.GetValue(obj) is not object val) return null;

            return double.TryParse(Convert.ToString(val, CultureInfo.InvariantCulture),
                NumberStyles.Any, CultureInfo.InvariantCulture, out var d)
                ? d
                : null;
        }
    }
}
