using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using EnergyProphet.Api.Services;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // 🔹 Supprimer toutes les définitions existantes
            var descriptors = services.Where(d => d.ServiceType == typeof(IAIService)).ToList();
            foreach (var d in descriptors)
            {
                services.Remove(d);
            }

            // 🔹 Ajouter le mock
            var mock = new Mock<IAIService>();
            mock.Setup(s => s.AnalyzeScenarioAsync(It.IsAny<object>()))
                .ReturnsAsync("Mocked AI analysis response.");

            services.AddSingleton<IAIService>(mock.Object);
        });
    }
}