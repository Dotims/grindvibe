using grindvibe_backend.Services;
using Microsoft.AspNetCore.Mvc;
using grindvibe_backend.Models;

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
        CancellationToken ct = default)
    {
        var result = await _exerciseService.SearchAsync(q, page, pageSize, ct);
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