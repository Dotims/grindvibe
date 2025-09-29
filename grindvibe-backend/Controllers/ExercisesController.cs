using grindvibe_backend.Services;
using grindvibe_backend.Models;
using Microsoft.AspNetCore.Mvc;
using grindvibe_backend.Services.Filtering; 
using Microsoft.Extensions.Primitives;

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
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "ExerciseDB upstream error", detail = ex.Message });
        }
        catch (System.Text.Json.JsonException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Invalid JSON from ExerciseDB", detail = ex.Message });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ExerciseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string[]? muscles = null,
        [FromQuery] string[]? equipment = null,
        CancellationToken ct = default)
    {
        static string[] ParseMulti(StringValues rawValues, string[]? binderValues)
        {
            var fromRaw = rawValues
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .SelectMany(v => v!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

            var fromBinder = (binderValues ?? Array.Empty<string>())
                .Where(v => !string.IsNullOrWhiteSpace(v));

            return fromRaw
                .Concat(fromBinder)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        var musclesParsed   = ParseMulti(Request.Query["muscles"], muscles);
        var equipmentParsed = ParseMulti(Request.Query["equipment"], equipment);

        string? searchSeed =
            !string.IsNullOrWhiteSpace(q)               ? q
        : (musclesParsed.Length > 0)                  ? musclesParsed[0]
        : (equipmentParsed.Length > 0)                ? equipmentParsed[0]
                                                        : null;

        var hasFilters = (musclesParsed.Length + equipmentParsed.Length) > 0;

        if (!hasFilters)
        {
            try
            {
                var fast = await _exerciseService.SearchAsync(q, page, pageSize, ct);
                return Ok(fast);
            }
            catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "ExerciseDB rate limit (429)", detail = ex.Message });
            }
            catch (System.Text.Json.JsonException ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = "Invalid JSON from ExerciseDB", detail = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = "Upstream error", detail = ex.Message });
            }
        }

        // pobieranie i filtrowanie lokalne
        var need = Math.Max(page, 1) * Math.Max(pageSize, 1);
        var agg = new List<ExerciseDto>(need);

        const int upPageSize = 25;
        int upPage = 1;
        int totalUpstream = int.MaxValue;
        int safety = 12;

        try
        {
            while (agg.Count < need &&
                   (upPage - 1) * upPageSize < totalUpstream &&
                   safety-- > 0)
            {
                var batch = await _exerciseService.SearchAsync(searchSeed, upPage, upPageSize, ct);

                if (upPage == 1) totalUpstream = batch.Total;

                var filtered = ExerciseFilter.Apply(batch.Items ?? Enumerable.Empty<ExerciseDto>(),
                                                    musclesParsed,
                                                    equipmentParsed);

                agg.AddRange(filtered);

                if ((batch.Items?.Count ?? 0) < upPageSize) break;

                upPage++;
                await Task.Delay(120, ct);
            }
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "ExerciseDB rate limit (429)", detail = ex.Message });
        }
        catch (System.Text.Json.JsonException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Invalid JSON from ExerciseDB", detail = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Upstream error", detail = ex.Message });
        }

        var skip = (Math.Max(page, 1) - 1) * Math.Max(pageSize, 1);
        var pageItems = agg.Skip(skip).Take(pageSize).ToList();

        return Ok(new PagedResponse<ExerciseDto>
        {
            Page     = page,
            PageSize = pageSize,
            Total    = agg.Count,
            Items    = pageItems
        });
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
