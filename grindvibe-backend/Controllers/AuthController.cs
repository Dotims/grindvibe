using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Helpers;
using Google.Apis.Auth;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IPasswordHasher<User> hasher, IJwtTokenGenerator jwt, IConfiguration config)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _config = config;
    }

    public record RegisterDto(string? nickname, string Email, string Password);
    public record LoginDto(string Email, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var email = request.Email.Trim().ToLower();

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict("Użytkownik z takim e-mailem już istnieje.");

        var user = new User
        {
            Email = email,
            nickname = request.nickname,
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.Generate(user);

        return Ok(new
        {
            token,
            user = new { user.Id, user.Email, user.nickname, user.AvatarUrl }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return Unauthorized("Nieprawidłowy e-mail lub hasło.");

        var res = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (res == PasswordVerificationResult.Failed)
            return Unauthorized("Nieprawidłowy e-mail lub hasło.");

        var token = _jwt.Generate(user);

        return Ok(new { token, user = new { user.Id, user.Email, user.nickname, user.AvatarUrl } });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request, [FromServices] IConfiguration config)
    {
        var authCode = request?.AuthCode;

        if (string.IsNullOrWhiteSpace(authCode))
            return BadRequest("Missing authCode");

        Console.WriteLine($"Received authCode: {authCode}");

        var clientId = config["GoogleAuth:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        Console.WriteLine($"ClientId: {clientId}");
        
        if (string.IsNullOrWhiteSpace(clientId))
            return StatusCode(500, "Google ClientId not configured");

        var tokenResponse = await GetGoogleIdToken(authCode, clientId);

        if (tokenResponse == null)
            return Unauthorized("Failed to get ID token from Google.");

        var idToken = tokenResponse.IdToken;
        Console.WriteLine($"Received ID Token: {idToken}");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
            Console.WriteLine($"Token payload: {payload.Email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error validating Google token: {ex.Message}");
            return Unauthorized("Invalid Google token");
        }

        if (payload.EmailVerified != true)
            return Unauthorized("Email not verified");

        var email = payload.Email;
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                PasswordHash = string.Empty, 
                nickname = payload.Name ?? email,
                AvatarUrl = payload.Picture
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }
        else
        {
            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.AvatarUrl = payload.Picture;
                await _db.SaveChangesAsync();
            }
        }

        var token = _jwt.Generate(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Email,
                user.nickname,
                user.AvatarUrl
            }
        });
    }

    private async Task<TokenResponse?> GetGoogleIdToken(string authCode, string clientId)
    {
        using (var client = new HttpClient())
        {
            var clientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
            var redirectUri = Environment.GetEnvironmentVariable("GOOGLE_REDIRECT_URI");    

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("code", authCode),
                new KeyValuePair<string, string>("client_id", clientId),
                new KeyValuePair<string, string>("client_secret", clientSecret),  
                new KeyValuePair<string, string>("redirect_uri", redirectUri),  
                new KeyValuePair<string, string>("grant_type", "authorization_code")
            });

            var response = await client.PostAsync("https://oauth2.googleapis.com/token", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
                    if (tokenResponse == null)
                    {
                        Console.WriteLine("Error: Response content is null after deserialization.");
                        return null;
                    }
                    return tokenResponse;
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"Error deserializing response: {ex.Message}");
                    return null;
                }
            }
            else
            {
                Console.WriteLine($"Error response from Google: {responseContent}");
                return null;
            }
        }
    }



    public class TokenResponse
    {
        public string? IdToken { get; set; }
        public string? AccessToken { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string? AuthCode { get; set; }
    }
}
