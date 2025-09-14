using System.Text.Json;
using EnergyProphet.Api.Models;

public static class ScenarioPromptBuilder
{
        public static string BuildPrompt(Country country, AnalysisSummaryDto summary)
        {
                var countryJson = JsonSerializer.Serialize(country, new JsonSerializerOptions { WriteIndented = true });
                var changesJson = JsonSerializer.Serialize(summary, new JsonSerializerOptions { WriteIndented = true });

                var explanation = @"
Assumptions & unit conversions:
- 1 TWh = 1,000,000 MWh.
- Emission factor units are reported per MWh (kg/MWh or t/MWh); delta CO₂ is in tonnes.
- Provided NewTWh represent the user's target generation for 2050.
";

var instructions = @"
You are an energy policy and power systems expert. You are analyzing a proposed electricity generation scenario for the year 2050 for a given country.
Address the scenario as if speaking directly to the user.  

Guidelines for your response:
- Start with: ' Let's analyze your choices ! '
- Keep the analysis concise: maximum 15 sentences.
- Cover these key aspects:
  1) Feasibility.
  2) Emissions.
  3) Energy security and variability.
  4) Balanced conclusion, but clearly say when it's a bad idea.
- Be factual and precise.
";

                return $@"
{instructions}
----- COUNTRY DATA -----
{countryJson}
----- USER CHOICES -----
{changesJson}
{explanation}
";
        }
}