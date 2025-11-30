using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("routines")]
public class RoutinesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoutinesController(AppDbContext db)
    {
        _db = db;
    }

    // Helper - must be same like in UsersController
    private static int? GetUserIdFromClaims(ClaimsPrincipal principal)
    {
        Console.WriteLine("[CONTROLLER] Sprawdzam Claims:");
        foreach (var c in principal.Claims)
        {
            Console.WriteLine($" - {c.Type}: {c.Value}");
        }

        var raw =
            principal.FindFirst("id")?.Value ??
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
            principal.FindFirst("sub")?.Value;

        if (raw == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("[CONTROLLER] BŁĄD: Nie znaleziono claima z ID użytkownika!");
            Console.ResetColor();
            return null;
        }

        if (int.TryParse(raw, out var id))
        {
            return id;
        }

        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"[CONTROLLER] BŁĄD: Znaleziono ID '{raw}', ale to nie jest liczba!");
        Console.ResetColor();
        return null;
    }

    // DTO zgodne z frontem: RoutineCreateDto w
    // grindvibe-frontend/src/api/routines.ts
    public record CreateRoutineExerciseDto(
        string ExerciseId,
        string? Name,
        int Order,
        int? TargetSets,
        int? TargetRepsMin,
        int? TargetRepsMax,
        int? TargetRpe,
        int? RestSeconds,
        string? Notes
    );

    public record CreateRoutineDayDto(
        string Name,
        string? Notes,
        List<CreateRoutineExerciseDto> Exercises
    );

    public record CreateRoutineDto(
        string Name,
        string? Description,
        List<CreateRoutineDayDto> Days
    );

    public record RoutineDto(
        int Id,
        string Name,
        string Slug, // <--- NOWE POLE
        string? Description,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );

    // Helper to generate URL-friendly slugs
    private string GenerateSlug(string name)
    {
        string slug = name.ToLowerInvariant();
        // Replace specific characters if needed (e.g. accents)
        slug = slug.Replace("ą", "a").Replace("ć", "c").Replace("ę", "e").Replace("ł", "l").Replace("ń", "n").Replace("ó", "o").Replace("ś", "s").Replace("ź", "z").Replace("ż", "z");
        // Remove invalid characters
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        // Replace spaces with hyphens
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');
        
        // Append random suffix to ensure uniqueness
        return $"{slug}-{Guid.NewGuid().ToString().Substring(0, 4)}";
    }

    // POST /routines
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateRoutineDto dto)
    {
        // Request log
        Console.WriteLine("--> Received POST /routines"); 

        var userId = GetUserIdFromClaims(User);
        
        if (userId is null) 
        {
            // ERROR: Could not read userId from token
            Console.WriteLine("--> ERROR: Could not read userId from token.");
            return Unauthorized("Invalid token - missing ID.");
        }

        // Success: User ID
        Console.WriteLine($"--> Success: User ID: {userId}");

        // Validation
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required" });

        if (dto.Days is null || dto.Days.Count == 0)
            return BadRequest(new { message = "At least one day is required" });

        var routine = new Routine
        {
            UserId = userId.Value,
            Name = dto.Name,
            Description = dto.Description,
            Slug = GenerateSlug(dto.Name),
            CreatedAt = DateTime.UtcNow,
            Days = dto.Days.Select(d => new RoutineDay
            {
                Name = d.Name,
                Notes = d.Notes,
                Exercises = d.Exercises.Select(e => new RoutineExercise
                {
                    ExerciseId = e.ExerciseId,
                    Name = e.ExerciseId, // Temporary: use ID as name if not provided
                    Order = e.Order,
                    TargetSets = e.TargetSets,
                    TargetRepsMin = e.TargetRepsMin,
                    TargetRepsMax = e.TargetRepsMax,
                    TargetRpe = e.TargetRpe,
                    RestSeconds = e.RestSeconds,
                    Notes = e.Notes
                }).ToList()
            }).ToList()
        };

        _db.Routines.Add(routine);
        
        try 
        {
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Database save failed
            Console.WriteLine($"--> DATABASE ERROR: {ex.Message}");
            return StatusCode(500, new { message = "Database save error", detail = ex.Message });
        }

        // Zwracamy DTO z nowym slugiem
        var outDto = new RoutineDto(
            routine.Id,
            routine.Name,
            routine.Slug, 
            routine.Description,
            routine.CreatedAt,
            routine.UpdatedAt
        );

        return CreatedAtAction(nameof(GetById), new { id = routine.Id }, outDto);
    }

    // GET /routines - list mine
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<RoutineDto>>> ListMine()
    {
        var userId = GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var routines = await _db.Routines
            .Where(r => r.UserId == userId.Value)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RoutineDto(
                r.Id,
                r.Name,
                r.Slug, // Include slug in list
                r.Description,
                r.CreatedAt,
                r.UpdatedAt
            ))
            .ToListAsync();

        return Ok(routines);
    }

    // GET /routines/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();

        // 1. Fetch data with INCLUDE (important!)
        var r = await _db.Routines
            .Include(x => x.Days)
            .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);

        if (r is null) return NotFound();

        // 2. Map to DTO
        var dto = new
        {
            r.Id,
            r.Name,
            r.Description,
            r.CreatedAt,
            // Map Days and Exercises structure
            Days = r.Days.Select(d => new
            {
                d.Id,
                d.Name,
                d.Notes,
                Exercises = d.Exercises.OrderBy(e => e.Order).Select(e => new
                {
                    e.Id,
                    e.ExerciseId,
                    e.Name,
                    e.Order,
                    e.Notes,       // Sets/reps stored here
                    e.RestSeconds
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();

        var routine = await _db.Routines
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId.Value);

        if (routine is null) return NotFound();

        _db.Routines.Remove(routine);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("by-slug/{slug}")]
    [Authorize]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();

        var r = await _db.Routines
            .Include(x => x.Days)
            .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(x => x.Slug == slug && x.UserId == userId.Value);

        if (r is null) return NotFound();

        var dto = new
        {
            r.Id,
            r.Name,
            r.Slug,
            r.Description,
            r.CreatedAt,
            Days = r.Days.Select(d => new
            {
                d.Id,
                d.Name,
                d.Notes,
                Exercises = d.Exercises.OrderBy(e => e.Order).Select(e => new
                {
                    e.Id,
                    e.ExerciseId,
                    e.Name,
                    e.Order,
                    e.Notes,
                    e.RestSeconds
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    // PUT /routines/{id}
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] CreateRoutineDto dto)
    {
        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();

        // 1. Fetch existing routine with children
        var routine = await _db.Routines
            .Include(r => r.Days)
            .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId.Value);

        if (routine is null) return NotFound();

        // 2. Update basic fields
        routine.Name = dto.Name.Trim();
        routine.Description = dto.Description?.Trim();
        routine.UpdatedAt = DateTime.UtcNow;

        // 3. Replace children entities (Days & Exercises)
        // This strategy avoids complex synchronization logic by removing old entries and adding new ones.
        _db.RoutineDays.RemoveRange(routine.Days);
        
        routine.Days = dto.Days.Select(d => new RoutineDay
        {
            Name = d.Name.Trim(),
            Notes = d.Notes,
            Exercises = d.Exercises.Select(e => new RoutineExercise
            {
                ExerciseId = e.ExerciseId,
                Name = e.ExerciseId, // Or fetch name from exercise DB if available
                Order = e.Order,
                TargetSets = e.TargetSets,
                TargetRepsMin = e.TargetRepsMin,
                TargetRepsMax = e.TargetRepsMax,
                TargetRpe = e.TargetRpe,
                RestSeconds = e.RestSeconds,
                Notes = e.Notes
            }).ToList()
        }).ToList();

        await _db.SaveChangesAsync();

        return NoContent();
    }
}