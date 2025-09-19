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
        [FromQuery] int pageSize = 10,
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

        static string Norm(string? s) =>
            string.IsNullOrWhiteSpace(s)
                ? string.Empty
                : string.Join(" ", s.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

        static string Canon(string s) => string.IsNullOrEmpty(s) ? s : (s.EndsWith('s') ? s[..^1] : s);

        static string NormCanon(string? s) => Canon(Norm(s));

        var musclesParsed   = ParseMulti(Request.Query["muscles"], muscles);
        var equipmentParsed = ParseMulti(Request.Query["equipment"], equipment);

        var bodyPartsSet = new HashSet<string>(musclesParsed,   StringComparer.OrdinalIgnoreCase);
        var equipmentSet = new HashSet<string>(equipmentParsed, StringComparer.OrdinalIgnoreCase);

        static IEnumerable<string> ExpandBodyPartAliases(IEnumerable<string> terms)
        {
            foreach (var t in terms)
            {
                var x = t.Trim().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(x)) continue;

                yield return x;

                if (x == "back")  { yield return "upper back"; yield return "lower back"; }
                if (x == "arms")  { yield return "upper arms"; yield return "lower arms"; }
                if (x == "leg")   { yield return "upper leg";  yield return "lower leg";  }
                if (x == "chest") { yield return "upper chest"; yield return "lower chest"; }
            }
        }

        var bodyPartsExpanded = new HashSet<string>(ExpandBodyPartAliases(bodyPartsSet), StringComparer.OrdinalIgnoreCase);

        var hasFilters = bodyPartsExpanded.Count > 0 || equipmentSet.Count > 0;
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

        static IEnumerable<ExerciseDto> ApplyFilters(
            IEnumerable<ExerciseDto> source,
            HashSet<string> bodyPartsExpanded,
            HashSet<string> equipmentSet)
        {
            var query = source ?? Enumerable.Empty<ExerciseDto>();

            var requestedParts = bodyPartsExpanded
                .Select(NormCanon)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToArray();

            if (requestedParts.Length > 0)
            {
                query = query.Where(e =>
                {
                    var actual = NormCanon(e.BodyPart);
                    if (string.IsNullOrEmpty(actual)) return false;

                    return requestedParts.Any(req =>
                        actual == req ||
                        actual.Contains(req) ||
                        req.Contains(actual)
                    );
                });
            }

            var requestedEquip = equipmentSet
                .Select(Norm)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToHashSet();

            if (requestedEquip.Count > 0)
            {
                query = query.Where(e =>
                    (e.Equipment ?? new List<string>())
                        .Select(Norm)
                        .Any(eq => requestedEquip.Contains(eq))
                );
            }

            return query;
        }

        var needCount = Math.Max(page, 1) * Math.Max(pageSize, 1);
        var acc = new List<ExerciseDto>(needCount);

        const int upstreamPageSize = 25; 
        int upstreamPage = 1;
        int totalUpstream = int.MaxValue;
        int safetyMaxPages = 4; 

        try
        {
            while (acc.Count < needCount &&
                (upstreamPage - 1) * upstreamPageSize < totalUpstream &&
                safetyMaxPages-- > 0)
            {
                var batch = await _exerciseService.SearchAsync(q, upstreamPage, upstreamPageSize, ct);

                if (upstreamPage == 1)
                    totalUpstream = batch.Total;

                acc.AddRange(ApplyFilters(batch.Items ?? Enumerable.Empty<ExerciseDto>(), bodyPartsExpanded, equipmentSet));

                if ((batch.Items?.Count ?? 0) < upstreamPageSize)
                    break;

                upstreamPage++;

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
        var pageItems = acc.Skip(skip).Take(pageSize).ToList();

        var response = new PagedResponse<ExerciseDto>
        {
            Page     = page,
            PageSize = pageSize,
            Total    = totalUpstream, 
            Items    = pageItems
        };

        return Ok(response);
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
