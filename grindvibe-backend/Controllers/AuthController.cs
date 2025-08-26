using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IConfiguration _cfg;

    public AuthController(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration cfg)
    {
        _db = db;
        _hasher = hasher;
        _cfg = cfg;
    }

    public record RegisterDto(string? FirstName, string? LastName, string Email, string Password);
    public record LoginDto(string Email, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict("Użytkownik z takim e-mailem już istnieje.");

        var user = new User
        {
            Email = email,
            FirstName = dto.FirstName,
            LastName = dto.LastName
        };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Created("", new { user.Id, user.Email, user.FirstName, user.LastName });
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

        var token = GenerateJwt(user);
        return Ok(new { token, user = new { user.Id, user.Email, user.FirstName, user.LastName } });
    }

    private string GenerateJwt(User user)
    {
        var issuer = _cfg["Jwt:Issuer"]!;
        var audience = _cfg["Jwt:Audience"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", $"{user.FirstName} {user.LastName}".Trim())
        };

        var token = new JwtSecurityToken(issuer, audience, claims,
            expires: DateTime.UtcNow.AddDays(1), signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
