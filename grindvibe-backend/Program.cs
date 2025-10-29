using System.Text;
using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using grindvibe_backend.Config;
using grindvibe_backend.Helpers;
using grindvibe_backend.Services;
using System.Net.Http.Headers;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Add environment variables support
builder.Configuration.AddEnvironmentVariables();

// Database configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") 
        ?? "Data Source=grindvibe.db"));

// Hash for passwords
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// Load environment variables and JSON configuration files
builder.Configuration.AddJsonFile(".env", optional: true, reloadOnChange: true); // .env file support
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Bind JwtOptions from configuration
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// Service for generating JWT tokens
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddControllers();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT Token configuration
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is missing in configuration.");
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer   = !string.IsNullOrEmpty(jwtIssuer),
            ValidIssuer = jwtIssuer,
            ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
            ValidAudience    =  jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// External service configuration (Exercise API)
builder.Services.AddHttpClient<IExerciseService, ExerciseDbService>(c =>
{
    c.BaseAddress = new Uri("https://www.exercisedb.dev/api/v1/");
    c.Timeout = TimeSpan.FromSeconds(20);
});


Env.Load();
// Google ClientId configuration from .env or appsettings
var googleClientId = builder.Configuration["GoogleAuth:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
if (string.IsNullOrEmpty(googleClientId))
{
    throw new InvalidOperationException("Google ClientId is missing in the configuration.");
}

// Run application
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
