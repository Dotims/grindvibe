using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Helpers;
using Google.Apis.Auth;
using System.Net.Http;
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
    private readonly IHttpClientFactory _http;

    public AuthController(
        AppDbContext db,
        IPasswordHasher<User> hasher,
        IJwtTokenGenerator jwt,
        IConfiguration config,
        IHttpClientFactory http)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _config = config;
        _http = http;
    }

    public record RegisterDto(string? nickname, string Email, string Password);
    public record LoginDto(string Email, string Password);

    // DTO for auth-code flow
    public class GoogleCodeRequest
    {
        public string Code { get; set; } = "";
        public string? RedirectUri { get; set; } // default: "postmessage"
    }

    // Google token response (subset)
    public class GoogleTokenResponse
    {
        [JsonProperty("id_token")] public string? IdToken { get; set; }
        [JsonProperty("access_token")] public string? AccessToken { get; set; }
        [JsonProperty("refresh_token")] public string? RefreshToken { get; set; }
        [JsonProperty("expires_in")] public int ExpiresIn { get; set; }
        [JsonProperty("token_type")] public string? TokenType { get; set; }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var email = request.Email.Trim().ToLower();

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict("User with this email already exists.");

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
            return Unauthorized("Invalid email or password.");

        var res = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (res == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid email or password.");

        var token = _jwt.Generate(user);

        return Ok(new { token, user = new { user.Id, user.Email, user.nickname, user.AvatarUrl } });
    }

    // Google OAuth: Authorization Code flow (front sends { code, redirectUri: "postmessage" })
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLoginWithCode([FromBody] GoogleCodeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Code))
            return BadRequest("Missing code");

        var clientId = _config["GoogleAuth:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        var clientSecret = _config["GoogleAuth:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return StatusCode(500, "Google ClientId/ClientSecret not configured");

        var redirectUri = string.IsNullOrWhiteSpace(req.RedirectUri) ? "postmessage" : req.RedirectUri;

        // 1) Exchange code -> tokens
        var http = _http.CreateClient();
        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = req.Code,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["redirect_uri"] = redirectUri, // "postmessage" for installed-app like flow
            ["grant_type"] = "authorization_code"
        });

        var tokenResp = await http.PostAsync("https://oauth2.googleapis.com/token", form);
        var tokenText = await tokenResp.Content.ReadAsStringAsync();

        if (!tokenResp.IsSuccessStatusCode)
            return BadRequest(tokenText); // bubble up exact Google error (helps debugging)

        GoogleTokenResponse? tokens;
        try
        {
            tokens = JsonConvert.DeserializeObject<GoogleTokenResponse>(tokenText);
        }
        catch
        {
            return StatusCode(500, "Failed to parse Google token response");
        }

        if (string.IsNullOrWhiteSpace(tokens?.IdToken))
            return BadRequest("Google did not return id_token");

        // 2) Validate id_token
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                tokens.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
        }
        catch
        {
            return Unauthorized("Invalid Google id_token");
        }

        if (payload.EmailVerified != true)
            return Unauthorized("Email not verified");

        // 3) Upsert user
        var email = payload.Email.ToLowerInvariant();
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                nickname = payload.Name ?? email,
                AvatarUrl = payload.Picture,
                PasswordHash = "" // no local password for Google accounts
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }
        else if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
        {
            user.AvatarUrl = payload.Picture;
            await _db.SaveChangesAsync();
        }

        // 4) Issue app JWT
        var appToken = _jwt.Generate(user);
        return Ok(new { token = appToken, user = new { user.Id, user.Email, user.nickname, user.AvatarUrl } });
    }
}
