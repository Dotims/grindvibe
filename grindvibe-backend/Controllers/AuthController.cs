using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Helpers;
using Google.Apis.Auth;

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
    public async Task<IActionResult> GoogleLogin([FromBody] dynamic body, [FromServices] IConfiguration config)
    {
        var idToken = (string?)body?.IdToken;

        if (string.IsNullOrWhiteSpace(idToken))
            return BadRequest("Missing IdToken");

        Console.WriteLine($"Received IdToken: {idToken}");

        var clientId = config["GoogleAuth:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        Console.WriteLine($"ClientId: {clientId}");
        
        if (string.IsNullOrWhiteSpace(clientId))
            return StatusCode(500, "Google ClientId not configured");

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
}
