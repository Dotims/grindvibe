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
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// env
builder.Configuration.AddEnvironmentVariables();
Env.Load(); // optional

// db
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=grindvibe.db"));

// identity helpers
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// config + jwt
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

// JWT generator DI (fix)
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
            ValidIssuer = jwtIssuer,
            ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// controllers
builder.Services.AddControllers();

// http clients
builder.Services.AddHttpClient(); // for AuthController token exchange
builder.Services.AddHttpClient<IExerciseService, ExerciseDbService>(c =>
{
    c.BaseAddress = new Uri("https://www.exercisedb.dev/api/v1/");
    c.Timeout = TimeSpan.FromSeconds(20);
});

// cors
const string AllowFrontend = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(AllowFrontend, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
        // enable .AllowCredentials() only if you use cookies
    });
});

// swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// sanity check Google client id
var googleClientId =
    builder.Configuration["GoogleAuth:ClientId"] ??
    Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
if (string.IsNullOrWhiteSpace(googleClientId))
    throw new InvalidOperationException("GoogleAuth:ClientId is missing.");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors(AllowFrontend);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
