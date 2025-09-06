using System.Net;
using System.Net.Http.Json;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using EnergyProphet.Api.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using EnergyProphet.Api.Services;

namespace EnergyProphet.Tests
{

    public class IntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public IntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetCountries_ReturnsList()
        {
            var response = await _client.GetAsync("/api/countries");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var countries = await response.Content.ReadFromJsonAsync<IEnumerable<Country>>();
            countries.Should().NotBeNull();
            countries.Should().NotBeEmpty();
        }

        [Fact]
        public async Task GetCountry_ReturnsOne_WhenExists()
        {
            var response = await _client.GetAsync("/api/countries/che");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var country = await response.Content.ReadFromJsonAsync<Country>();
            country.Should().NotBeNull();
            country!.Id.Should().Be("che");
        }

        [Fact]
        public async Task GetCountry_ReturnsNotFound_WhenMissing()
        {
            var response = await _client.GetAsync("/api/countries/does-not-exist");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task AnalyzeScenario_ReturnsMockedAnalysis()
        {
            var payload = new { description = "Transition to renewables" };

            var response = await _client.PostAsJsonAsync("/api/scenario/analyze", payload);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var result = await response.Content.ReadAsStringAsync();
            result.Should().Contain("Mocked AI analysis response.");
        }
    }
}