using Microsoft.AspNetCore.Mvc;
using EchoLetters_backend.Data;
using Microsoft.EntityFrameworkCore;
using EchoLetters_backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EchoLetters_backend.Controllers;

[ApiController]

[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // Endpoint: POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        var existingUser = _context.Users.FirstOrDefault(u => u.Email == user.Email);
        if (existingUser != null)
        {
            return BadRequest("Użytkownik już istnieje.");
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Rejestracja zakończona sukcesem.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User login)
    {
        // szukanie uzytkownika po emailu
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email && u.Password == login.Password);

        if (user == null)
        {
            return Unauthorized("Niepoprawne dane logowania.");
        }

        // generowanie tokenu jwt
        var token = JwtTokenGenerator.GenerateToken(user, _config);

        return Ok(new { token });
    }

    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _context.Users.ToList();
        return Ok(users);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue("id");
        var email = User.FindFirstValue(ClaimTypes.Email);

        return Ok(new
        {
            userId,
            email
        });
    }
}
