using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims;

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
        string? Description,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );

    // POST /routines
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateRoutineDto dto)
    {
        Console.WriteLine("--> Otrzymano żądanie POST /routines"); // Log wejścia

        var userId = GetUserIdFromClaims(User);
        
        if (userId is null) 
        {
            Console.WriteLine("--> BŁĄD: Nie udało się odczytać userId z tokena.");
            return Unauthorized("Nieprawidłowy token - brak ID.");
        }

        Console.WriteLine($"--> Sukces: Użytkownik ID: {userId}");

        // Walidacja
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required" });

        if (dto.Days is null || dto.Days.Count == 0)
            return BadRequest(new { message = "At least one day is required" });

        var routine = new Routine
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            UserId = userId.Value,
            Days = dto.Days.Select(d => new RoutineDay
            {
                Name = d.Name.Trim(),
                Notes = d.Notes,
                Exercises = d.Exercises.Select(e => new RoutineExercise
                {
                    ExerciseId = e.ExerciseId,
                    Name = e.ExerciseId, // Tymczasowo ID jako nazwa, jeśli front nie wysyła nazwy
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
            Console.WriteLine($"--> BŁĄD BAZY DANYCH: {ex.Message}");
            // Jeśli tu wejdzie, to znaczy że migracja nie poszła
            return StatusCode(500, new { message = "Błąd zapisu do bazy", detail = ex.Message });
        }

        var outDto = new RoutineDto(
            routine.Id,
            routine.Name,
            routine.Description,
            routine.CreatedAt,
            routine.UpdatedAt
        );

        return CreatedAtAction(nameof(GetById), new { id = routine.Id }, outDto);
    }

    // GET /routines – lista moich
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

        // 1. Pobierz dane z bazy z INCLUDE (ważne!)
        var r = await _db.Routines
            .Include(x => x.Days)
            .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);

        if (r is null) return NotFound();

        // 2. Zmapuj dane do DTO (To tutaj brakowało 'Days'!)
        var dto = new
        {
            r.Id,
            r.Name,
            r.Description,
            r.CreatedAt,
            // WAŻNE: Musisz przepisać strukturę Days i Exercises
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
                    e.Notes,       // Tu są zapisane serie/powtórzenia
                    e.RestSeconds
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }
}