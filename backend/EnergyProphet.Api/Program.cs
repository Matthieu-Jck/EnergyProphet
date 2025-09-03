using EnergySim.Api.Services;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);


// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
c.SwaggerDoc("v1", new OpenApiInfo { Title = "EnergySim API", Version = "v1" });
});


// DI: repository and simulation service
builder.Services.AddSingleton<IRepository, DataRepository>();
builder.Services.AddTransient<ISimulationService, SimulationService>();


var app = builder.Build();


if (app.Environment.IsDevelopment()) {
app.UseSwagger();
app.UseSwaggerUI();
}


app.UseHttpsRedirection();
app.MapControllers();
app.Run();