using System.Text.Json;
using EnergyProphet.Api.Models;

public static class ScenarioPromptBuilder
{
        public static string BuildPrompt(Country country, AnalysisSummaryDto summary)
        {
                var countryJson = JsonSerializer.Serialize(country, new JsonSerializerOptions { WriteIndented = true });
                var changesJson = JsonSerializer.Serialize(summary, new JsonSerializerOptions { WriteIndented = true });

                var explanation = @"
                        - Provided NewTWh represent the user's target generation for 2050.
                        - Unprovided changes means the current year's production wasn't changed.
                        - The countries have already maximized their practical hydropower potential.
                        - Importing is feasible, but worth mentionning
                        ";

                var instructions = @"
                        You are an energy policy and power systems engineer.
                        You're sent the plan to reach the required electricity generation for the year 2050 for a given country.
                        Analyze the scenario as if speaking directly to the user.

                        Guidelines:
                        - Ignore public opinion, keep it scientific, be slightly pro-nuclear.
                        - Keep the analysis concise: maximum 15 sentences.
                        - Start with 'To reach the required  electricity demand for 2050 in {country}, you proposed an increase in [...] \n\n '
                        - Cover these key aspects in clear, separated sections:
                        1) **Feasibility**
                        2) **Emissions** (no maths or numbers, just overall facts)
                        3) **Variability**
                        4) **Cost**
                        5) A precise **Conclusion**
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