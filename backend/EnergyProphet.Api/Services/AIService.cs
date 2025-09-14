using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
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
            _googleApiKey = configuration["GOOGLE_API_KEY"] ?? throw new ArgumentNullException("GOOGLE_API_KEY");
            _googleModelName = configuration["GOOGLE_MODEL"] ?? "gemini-2.0-flash";
            _googleBaseUrl = configuration["GOOGLE_BASE_URL"] ?? "https://generativelanguage.googleapis.com";
            _maxNewTokens = int.TryParse(configuration["AI_MAX_OUTPUT_TOKENS"] ?? configuration["MAX_OUTPUT_TOKENS"], out var m) ? Math.Clamp(m, 16, 20000) : 2048;
            _temperature = double.TryParse(configuration["AI_TEMPERATURE"] ?? configuration["TEMPERATURE"], out var t) ? Math.Clamp(t, 0.0, 2.0) : 0.2;
            _topP = double.TryParse(configuration["AI_TOP_P"] ?? configuration["TOP_P"], out var p) ? Math.Clamp(p, 0.0, 1.0) : 0.95;
        }

        public async Task<AnalysisResultDto> AnalyzeScenarioAsync(Country country, IEnumerable<UserChangeDto> userChoices, CancellationToken ct = default)
        {
            if (country == null) throw new ArgumentNullException(nameof(country));
            if (userChoices == null) throw new ArgumentNullException(nameof(userChoices));

            var changes = userChoices.ToList();
            var techById = country.Technologies?.ToDictionary(t => t.Id, t => t) ?? new Dictionary<string, Technology>();
            var enriched = new List<EnrichedChangeDto>();

            foreach (var ch in changes)
            {
                if (string.IsNullOrWhiteSpace(ch.Id)) continue;

                techById.TryGetValue(ch.Id, out var tech);

                // Only TWh values. If missing, use 0.0 (frontend is expected to provide NewTWh for the complete plan).
                var prevTWhRaw = TryGetDoubleProperty(ch, "PrevTWh") ?? 0.0;
                var newTWhRaw = TryGetDoubleProperty(ch, "NewTWh") ?? prevTWhRaw;

                // Round to integers for everything we present to the model
                var prevTWhInt = Convert.ToInt64(Math.Round(prevTWhRaw, 0));
                var newTWhInt = Convert.ToInt64(Math.Round(newTWhRaw, 0));
                var deltaTWhInt = newTWhInt - prevTWhInt;

                var (efValue, efUnit) = GetEmissionFactor(tech);
                var deltaCo2 = CalculateDeltaCo2Tonnes(deltaTWhInt, efValue, efUnit);
                long? deltaCo2Rounded = deltaCo2.HasValue ? Convert.ToInt64(Math.Round(deltaCo2.Value, 0)) : (long?)null;

                enriched.Add(new EnrichedChangeDto
                {
                    Id = ch.Id,
                    Name = TryGetStringProperty(tech, "Name") ?? ch.Id,
                    // keep DTO's numeric types; store rounded integers (as doubles if DTO uses double)
                    PrevTWh = Convert.ToDouble(prevTWhInt),
                    NewTWh = Convert.ToDouble(newTWhInt),
                    DeltaTWh = Convert.ToDouble(deltaTWhInt),
                    EmissionFactor = efValue.HasValue ? Math.Round(efValue.Value, 6) : (double?)null,
                    EmissionFactorUnit = efUnit.ToString(),
                    DeltaCo2Tonnes = deltaCo2Rounded.HasValue ? Convert.ToDouble(deltaCo2Rounded.Value) : (double?)null
                });
            }

            // DERIVE TOTAL FROM SUBMITTED NEW TWh VALUES — frontend provides the complete 2050 plan.
            var computedNewTotalTWh = Convert.ToInt64(enriched.Sum(e => Math.Round(e.NewTWh, 0)));
            var summary = new AnalysisSummaryDto
            {
                RequestedAtUtc = DateTime.UtcNow,
                CountryId = country.Id,
                CountryName = TryGetStringProperty(country, "Name") ?? country.Id,
                CountryTotalGenerationTWh = Convert.ToDouble(computedNewTotalTWh),
                Changes = enriched,
                Warnings = new List<string>()
            };

            var prompt = BuildIntegerOnlyPrompt(summary, enriched, computedNewTotalTWh);

            var aiText = await CallGoogleAsync(prompt, ct) ?? string.Empty;
            const int MaxChars = 20000;
            if (aiText.Length > MaxChars) aiText = aiText.Substring(0, MaxChars) + "...(truncated)";

            return new AnalysisResultDto { Summary = summary, AnalysisText = aiText };
        }

        private string BuildIntegerOnlyPrompt(AnalysisSummaryDto summary, List<EnrichedChangeDto> changes, long totalTWh)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Complete 2050 electricity generation plan for {summary.CountryName} (id: {summary.CountryId}).");
            sb.AppendLine($"TOTAL (integer TWh): {totalTWh.ToString("N0", CultureInfo.InvariantCulture)} TWh.");
            sb.AppendLine();
            sb.AppendLine("The following list contains all technologies and their integer TWh values for 2050. THESE VALUES REPRESENT THE COMPLETE PLAN (sum of NewTWh equals the TOTAL above). DO NOT INFER any remaining percentage or missing generation — do not compute percentages.");
            sb.AppendLine();

            foreach (var c in changes)
            {
                var prev = Convert.ToInt64(Math.Round(c.PrevTWh, 0));
                var neu = Convert.ToInt64(Math.Round(c.NewTWh, 0));
                var d = Convert.ToInt64(Math.Round(c.DeltaTWh, 0));
                sb.Append($"- {c.Name ?? c.Id} (id: {c.Id}): Prev {prev} TWh -> New {neu} TWh (Δ {d} TWh).");
                if (c.DeltaCo2Tonnes.HasValue)
                {
                    var co2 = Convert.ToInt64(Math.Round(c.DeltaCo2Tonnes.Value, 0));
                    sb.Append($" Estimated ΔCO2: {co2} tonnes (EF: {c.EmissionFactor?.ToString(CultureInfo.InvariantCulture) ?? "N/A"} {c.EmissionFactorUnit}).");
                }
                sb.AppendLine();
            }

            sb.AppendLine();
            sb.AppendLine("Important instructions for the model:");
            sb.AppendLine("- Use only the integer TWh values above for calculations and descriptions.");
            sb.AppendLine("- Do NOT convert to or mention percent shares or 'remaining X%' — the plan is complete.");
            sb.AppendLine("- If you detect internal inconsistencies (e.g., negative totals), state them and how you resolved them.");
            return sb.ToString();
        }

        private async Task<string?> CallGoogleAsync(string prompt, CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.TryAddWithoutValidation("X-Goog-Api-Key", _googleApiKey);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.UserAgent.ParseAdd("energy-prophet/1.0");

            var url = $"{_googleBaseUrl.TrimEnd('/')}/v1beta/models/{_googleModelName}:generateContent";

            var payload = new Dictionary<string, object>
            {
                ["contents"] = new object[]
                {
                    new Dictionary<string, object>
                    {
                        ["role"] = "user",
                        ["parts"] = new object[] { new Dictionary<string, object> { ["text"] = prompt } }
                    }
                },
                ["generationConfig"] = new Dictionary<string, object>
                {
                    ["temperature"] = _temperature,
                    ["topP"] = _topP,
                    ["maxOutputTokens"] = _maxNewTokens,
                    ["candidateCount"] = 1
                }
            };

            var serialized = JsonSerializer.Serialize(payload, JsonOptions);
            using var content = new StringContent(serialized, Encoding.UTF8, "application/json");
            using var resp = await client.PostAsync(url, content, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);

            try
            {
                using var doc = JsonDocument.Parse(body);
                var extracted = ExtractFromGoogleResponse(doc.RootElement);
                return string.IsNullOrWhiteSpace(extracted) ? body : extracted;
            }
            catch (JsonException)
            {
                return body;
            }
        }

        private string ExtractFromGoogleResponse(JsonElement root)
        {
            if (root.TryGetProperty("candidates", out var candidates) && candidates.ValueKind == JsonValueKind.Array && candidates.GetArrayLength() > 0)
            {
                var cand = candidates[0];
                if (cand.TryGetProperty("content", out var contentElem) && contentElem.TryGetProperty("parts", out var parts) && parts.ValueKind == JsonValueKind.Array)
                {
                    var pieces = parts.EnumerateArray()
                                      .Select(p => p.ValueKind == JsonValueKind.Object && p.TryGetProperty("text", out var t) ? t.GetString() : p.ToString())
                                      .Where(s => !string.IsNullOrWhiteSpace(s));
                    return string.Join("", pieces);
                }

                if (cand.TryGetProperty("text", out var direct) && direct.ValueKind == JsonValueKind.String) return direct.GetString() ?? string.Empty;
                return cand.ToString();
            }

            if (root.TryGetProperty("content", out var topContent) && topContent.TryGetProperty("parts", out var parts2) && parts2.ValueKind == JsonValueKind.Array)
            {
                var pieces = parts2.EnumerateArray()
                                   .Select(p => p.ValueKind == JsonValueKind.Object && p.TryGetProperty("text", out var t) ? t.GetString() : p.ToString())
                                   .Where(s => !string.IsNullOrWhiteSpace(s));
                return string.Join("", pieces);
            }

            return string.Empty;
        }

        private double? CalculateDeltaCo2Tonnes(double deltaTWh, double? emissionFactorValue, EmissionUnit emissionUnit)
        {
            if (!emissionFactorValue.HasValue || emissionUnit == EmissionUnit.Unknown) return null;
            var mWh = deltaTWh * 1_000_000.0;
            if (emissionUnit == EmissionUnit.KgPerMWh) return mWh * emissionFactorValue.Value / 1000.0;
            if (emissionUnit == EmissionUnit.TonnesPerMWh) return mWh * emissionFactorValue.Value;
            return null;
        }

        private enum EmissionUnit { Unknown, KgPerMWh, TonnesPerMWh }

        private (double? value, EmissionUnit unit) GetEmissionFactor(object tech)
        {
            if (tech == null) return (null, EmissionUnit.Unknown);
            try
            {
                var type = tech.GetType();
                var names = new[] { "EmissionFactor_tCO2_per_MWh", "EmissionFactor_kgCO2_per_MWh", "EmissionFactor", "Co2", "CO2" };

                foreach (var name in names)
                {
                    var prop = type.GetProperty(name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                    if (prop == null) continue;
                    var val = prop.GetValue(tech);
                    if (val == null) continue;
                    if (double.TryParse(Convert.ToString(val, CultureInfo.InvariantCulture), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                    {
                        var lower = name.ToLowerInvariant();
                        if (lower.Contains("kg")) return (d, EmissionUnit.KgPerMWh);
                        if (lower.Contains("tco2") || lower.Contains("ton")) return (d, EmissionUnit.TonnesPerMWh);
                        return Math.Abs(d) > 10 ? (d, EmissionUnit.KgPerMWh) : (d, EmissionUnit.TonnesPerMWh);
                    }
                }

                foreach (var p in type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance))
                {
                    var n = p.Name.ToLowerInvariant();
                    if (!n.Contains("co2") && !n.Contains("emission") && !n.Contains("ef")) continue;
                    var v = p.GetValue(tech);
                    if (v == null) continue;
                    if (double.TryParse(Convert.ToString(v, CultureInfo.InvariantCulture), NumberStyles.Any, CultureInfo.InvariantCulture, out var d2))
                    {
                        return Math.Abs(d2) > 10 ? (d2, EmissionUnit.KgPerMWh) : (d2, EmissionUnit.TonnesPerMWh);
                    }
                }
            }
            catch { }
            return (null, EmissionUnit.Unknown);
        }

        private double? TryGetDoubleProperty(object obj, string propertyName)
        {
            if (obj == null) return null;
            var prop = obj.GetType().GetProperty(propertyName, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
            if (prop == null) return null;
            var val = prop.GetValue(obj);
            if (val == null) return null;
            if (double.TryParse(Convert.ToString(val, CultureInfo.InvariantCulture), NumberStyles.Any, CultureInfo.InvariantCulture, out var d)) return d;
            return null;
        }

        private string? TryGetStringProperty(object obj, string propertyName)
        {
            if (obj == null) return null;
            var prop = obj.GetType().GetProperty(propertyName, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
            return prop?.GetValue(obj)?.ToString();
        }
    }
}