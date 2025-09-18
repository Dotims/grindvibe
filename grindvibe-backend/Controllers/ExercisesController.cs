using grindvibe_backend.Services;
using Microsoft.AspNetCore.Mvc;
using grindvibe_backend.Models;
using Microsoft.Extensions.Primitives;
using System.Linq;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("exercises")]
public class ExercisesController : ControllerBase
{
    private readonly IExerciseService _exerciseService;

    public ExercisesController(IExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    [HttpGet("lists")]
    public async Task<IActionResult> GetList(CancellationToken ct)
    {
        try
        {
            var muscles = await _exerciseService.GetAllBodypartsAsync(ct);
            var equipments = await _exerciseService.GetAllEquipmentsAsync(ct);
            return Ok(new { muscles, equipments });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new
            {
                message = "ExerciseDB upstream error",
                detail = ex.Message
            });
        }
        catch (System.Text.Json.JsonException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new
            {
                message = "Invalid JSON from ExerciseDB",
                detail = ex.Message
            });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ExerciseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string[]? muscles = null,
        [FromQuery] string[]? equipment = null,
        CancellationToken ct = default)
    {
        var result = await _exerciseService.SearchAsync(q, page, pageSize, ct);

        static string[] ParseMulti(StringValues rawValues, string[]? binderValues)
        {
             var fromRaw = rawValues
                .SelectMany(v => v.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .ToArray();

            var fromBinder = binderValues ?? Array.Empty<string>();

            return fromRaw
                .Concat(fromBinder)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        var musclesParsed = ParseMulti(Request.Query["muscles"], muscles);
        var equipmentsParsed = ParseMulti(Request.Query["equipments"], equipment);

        IEnumerable<ExerciseDto> filtered = result.Items ?? new List<ExerciseDto>();

        if (musclesParsed.Length > 0)
        {
            filtered = filtered.Where(e =>
                (e.PrimaryMuscles   ?? new List<string>())
                    .Any(m => musclesParsed.Contains(m, StringComparer.OrdinalIgnoreCase))
                ||
                (e.SecondaryMuscles ?? new List<string>())
                    .Any(m => musclesParsed.Contains(m, StringComparer.OrdinalIgnoreCase))
            ); 
        }  

        if (equipmentsParsed.Length > 0)
        {
            filtered = filtered.Where(e =>
                (e.Equipment ?? new List<string>())
                    .Any(eq => equipmentsParsed.Contains(eq, StringComparer.OrdinalIgnoreCase))
            );
        }

        var filteredList = filtered.ToList();

        var response = new PagedResponse<ExerciseDto>
        {
            Page     = result.Page,
            PageSize = result.PageSize,
            Total    = filteredList.Count,
            Items    = filteredList
        };

        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ExerciseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var ex = await _exerciseService.GetByIdAsync(id, ct);
        if (ex is null) return NotFound();
        return Ok(ex);
    }
}