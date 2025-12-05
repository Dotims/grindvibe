using System.Security.Claims;
using grindvibe_backend.Data;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("workouts")]
public class WorkoutsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutsController(AppDbContext db)
    {
        _db = db;
    }

    private static int? GetUserIdFromClaims(ClaimsPrincipal principal)
    {
        var raw = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(raw, out int id)) return id;
        return null;
    }

    public record LogSetDto(string ExerciseId, string ExerciseName, int SetNumber, double? Weight, int? Reps, double? Rpe);
    public record FinishWorkoutDto(int? RoutineId, string Name, DateTime StartedAt, DateTime EndedAt, List<LogSetDto> Sets);

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Finish([FromBody] FinishWorkoutDto dto)
    {
        var userId = GetUserIdFromClaims(User);
        if (userId is null) return Unauthorized();

        var session = new WorkoutSession
        {
            UserId = userId.Value,
            RoutineId = dto.RoutineId,
            Name = dto.Name,
            StartedAt = dto.StartedAt,
            EndedAt = dto.EndedAt,
            Sets = dto.Sets.Select(s => new WorkoutSet
            {
                ExerciseId = s.ExerciseId,
                ExerciseName = s.ExerciseName,
                SetNumber = s.SetNumber,
                Weight = s.Weight,
                Reps = s.Reps,
                Rpe = s.Rpe
            }).ToList()
        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();

        return Ok(new { session.Id });
    }
}