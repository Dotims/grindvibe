using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Helpers;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IJwtTokenGenerator _jwt;

    public AuthController(AppDbContext db, IPasswordHasher<User> hasher, IJwtTokenGenerator jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
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

        var token = _jwt.Generate(user);
        
        return Ok(new { token, user = new { user.Id, user.Email, user.FirstName, user.LastName } });
    }

    
}
