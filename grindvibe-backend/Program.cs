using System.Text;
using grindvibe_backend.Data;
using grindvibe_backend.Helpers;
using grindvibe_backend.Services;
using grindvibe_backend.Config;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

// 1. Get key "hardcoded" from configuration
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("CRITICAL: 'Jwt:Key' not found in appsettings.json! Server cannot start.");
}

// 2. Configure Auth with this specific key
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    x.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[AUTH-FAIL] Powód: {context.Exception.GetType().Name}");
            Console.WriteLine($"[AUTH-FAIL] Wiadomość: {context.Exception.Message}");
            Console.ResetColor();
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"[AUTH-OK] Token ważny. User: {context.Principal?.Identity?.Name}");
            Console.ResetColor();
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[AUTH-WARN] Żądanie do {context.Request.Path} bez tokena!");
                Console.ResetColor();
            }
            return Task.CompletedTask;
        }
    };
});

// JWT generator DI (fix)
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

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
