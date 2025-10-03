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

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") 
        ?? "Data Source=grindvibe.db"));


// serwis do hashowania hasel
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// bindowanie konfiguracji JWT
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// serwis do generowania tokenów
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddControllers();

// konfiguracja CORS
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

var jwtSection = builder.Configuration.GetSection("Jwt");   
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Brakuje Jwt:Key w konfiguracji.");
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient<IExerciseService, ExerciseDbService>(c =>
{
    c.BaseAddress = new Uri("https://www.exercisedb.dev/api/v1/"); 
    c.Timeout = TimeSpan.FromSeconds(20);
});

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