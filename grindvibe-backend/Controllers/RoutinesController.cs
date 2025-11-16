using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    private int? GetUserId()
    {
        var raw =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("id")?.Value;

        return int.TryParse(raw, out var id) ? id : null;
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
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

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
                    Name = e.ExerciseId, 
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
        await _db.SaveChangesAsync();

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
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var routines = await _db.Routines
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RoutineDto(r.Id, r.Name, r.Description, r.CreatedAt, r.UpdatedAt))
            .ToListAsync();

        return Ok(routines);
    }

    // GET /routines/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var r = await _db.Routines
            .Include(x => x.Days)
            .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (r is null) return NotFound();

        var payload = new
        {
            r.Id,
            r.Name,
            r.Description,
            r.CreatedAt,
            r.UpdatedAt,
            Days = r.Days
                .OrderBy(d => d.Id)
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.Notes,
                    Exercises = d.Exercises
                        .OrderBy(e => e.Order)
                        .Select(e => new
                        {
                            e.Id,
                            e.ExerciseId,
                            e.Name,
                            e.Order,
                            e.TargetSets,
                            e.TargetRepsMin,
                            e.TargetRepsMax,
                            e.TargetRpe,
                            e.RestSeconds,
                            e.Notes
                        })
                })
        };

        return Ok(payload);
    }
}