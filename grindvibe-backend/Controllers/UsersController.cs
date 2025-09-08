using System.Security.Claims;
using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public UsersController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized("Nieprawidłowy token.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user is null) return Unauthorized();

        return Ok(new { user = new { user.Id, user.Email, user.nickname, user.AvatarUrl } });
    }

    [HttpPost("me/avatar")]
    [Authorize]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest("Brak pliku.");

        var allowedMime = new[] { "image/jpeg", "image/png", "image/webp" };
        var allowedExt  = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedMime.Contains(file.ContentType)) return BadRequest("Dozwolone: JPG, PNG, WEBP.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExt.Contains(ext)) return BadRequest("Nieprawidłowe rozszerzenie pliku.");

        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user is null) return Unauthorized();

        // --- KLUCZOWY FRAGMENT: BEZPIECZNE WYZNACZENIE WEBROOT ---
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            // Fallback do katalogu zawartości aplikacji (tam, gdzie jest .csproj)
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }
        Directory.CreateDirectory(webRoot); // utwórz wwwroot jeśli go nie ma

        var avatarsPath = Path.Combine(webRoot, "avatars");
        Directory.CreateDirectory(avatarsPath); // i avatars/ jeśli nie ma

        var fileName = $"{Guid.NewGuid()}{ext}";
        var physical = Path.Combine(avatarsPath, fileName);

        using (var stream = System.IO.File.Create(physical))
            await file.CopyToAsync(stream);

        // Usuń poprzedni lokalny avatar (opcjonalnie)
        if (!string.IsNullOrWhiteSpace(user.AvatarUrl) && user.AvatarUrl.Contains("/avatars/"))
        {
            try
            {
                var oldName = user.AvatarUrl.Split("/avatars/").Last();
                var oldPath = Path.Combine(avatarsPath, oldName);
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }
            catch { /* ignore */ }
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        user.AvatarUrl = $"{baseUrl}/avatars/{fileName}";
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { user = new { user.Id, user.Email, user.nickname, user.AvatarUrl } });
    }

    private static int? GetUserIdFromClaims(ClaimsPrincipal principal)
    {
        var raw =
            principal.FindFirst("id")?.Value ??
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            principal.FindFirst("sub")?.Value;

        return int.TryParse(raw, out var id) ? id : null;
    }
}