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

       // helpers
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

        // parsowanie
        var musclesParsed   = ParseMulti(Request.Query["muscles"], muscles);
        var equipmentParsed = ParseMulti(Request.Query["equipment"], equipment);

        var onlyBodyPart  = (musclesParsed.Length == 1) && (equipmentParsed.Length == 0);
        var onlyEquipment = (musclesParsed.Length == 0) && (equipmentParsed.Length == 1);
        var bothSingle    = (musclesParsed.Length == 1) && (equipmentParsed.Length == 1);

        if (onlyBodyPart)
        {
            var requested = musclesParsed[0];           
            var requestedNorm = NormCanon(requested);   

            var needCount = Math.Max(page, 1) * Math.Max(pageSize, 1);
            var acc = new List<ExerciseDto>(needCount);

            const int upstreamPageSize = 25; 
            int upstreamPage = 1;
            int safetyMaxPages = 8;       
            try
            {
                while (acc.Count < needCount && safetyMaxPages-- > 0)
                {
                    var batch = await _exerciseService.SearchAsync(requested, upstreamPage, upstreamPageSize, ct);

                    var filtered = (batch.Items ?? Enumerable.Empty<ExerciseDto>())
                        .Where(e =>
                        {
                            var actual = NormCanon(e.BodyPart);
                            if (string.IsNullOrEmpty(actual)) return false;
                            return actual == requestedNorm || actual.Contains(requestedNorm) || requestedNorm.Contains(actual);
                        });

                    acc.AddRange(filtered);

                    if ((batch.Items?.Count ?? 0) < upstreamPageSize) break;

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

            var skipCount = (Math.Max(page, 1) - 1) * Math.Max(pageSize, 1);
            var filteredPageItems = acc.Skip(skipCount).Take(pageSize).ToList();

            return Ok(new PagedResponse<ExerciseDto>
            {
                Page     = page,
                PageSize = pageSize,
                Total    = acc.Count,         
                Items    = filteredPageItems
            });
        }

        if (onlyEquipment)
        {
            try
            {
                var eq = equipmentParsed[0];
                var res = await _exerciseService.GetByEquipmentAsync(eq, page, pageSize, ct);
                return Ok(res);
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

        if (bothSingle)
        {
            var requested = musclesParsed[0];
            var requestedNorm = NormCanon(requested);

            var requestedEquip = NormCanon(equipmentParsed[0]);

            var needCount = Math.Max(page, 1) * Math.Max(pageSize, 1);
            var acc = new List<ExerciseDto>(needCount);

            const int upstreamPageSize = 25;
            int upstreamPage = 1;
            int safetyMaxPages = 8;

            try
            {
                while (acc.Count < needCount && safetyMaxPages-- > 0)
                {
                    var batch = await _exerciseService.SearchAsync(requested, upstreamPage, upstreamPageSize, ct);

                    var filtered = (batch.Items ?? Enumerable.Empty<ExerciseDto>())
                        .Where(e =>
                        {
                            var actual = NormCanon(e.BodyPart);
                            if (string.IsNullOrEmpty(actual)) return false;

                            var bodyOk = (actual == requestedNorm || actual.Contains(requestedNorm) || requestedNorm.Contains(actual));
                            if (!bodyOk) return false;
                            
                            var equipList = (e.Equipment ?? new List<string>()).Select(NormCanon); 
                            return equipList.Any(x => x == requestedEquip);
                        });

                    acc.AddRange(filtered);

                    if ((batch.Items?.Count ?? 0) < upstreamPageSize) break;

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

            var skipCount = (Math.Max(page, 1) - 1) * Math.Max(pageSize, 1);
            var filteredPageItems = acc.Skip(skipCount).Take(pageSize).ToList();

            return Ok(new PagedResponse<ExerciseDto>
            {
                Page     = page,
                PageSize = pageSize,
                Total    = acc.Count,
                Items    = filteredPageItems
            });
        }


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

            // BodyPart
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

            // Equipment
            var requestedEquip = equipmentSet
                .Select(NormCanon)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToArray();

            if (requestedEquip.Length > 0)
            {
                query = query.Where(e =>
                    (e.Equipment ?? new List<string>())
                    .Select(NormCanon)
                    .Any(eq => requestedEquip.Contains(eq))
                );
            }


            return query;
        }

        var need = Math.Max(page, 1) * Math.Max(pageSize, 1);
        var agg = new List<ExerciseDto>(need);

        const int upPageSize = 25; 
        int upPage = 1;
        int totalUpstream = int.MaxValue;
        int safety = 4;

        try
        {
            while (agg.Count < need &&
                (upPage - 1) * upPageSize < totalUpstream &&
                safety-- > 0)
            {
                var batch = await _exerciseService.SearchAsync(q, upPage, upPageSize, ct);

                if (upPage == 1)
                    totalUpstream = batch.Total;

                agg.AddRange(ApplyFilters(batch.Items ?? Enumerable.Empty<ExerciseDto>(), bodyPartsExpanded, equipmentSet));

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

        var skipCountFinal = (Math.Max(page, 1) - 1) * Math.Max(pageSize, 1);
        var pageItemsFinal = agg.Skip(skipCountFinal).Take(pageSize).ToList();

        var response = new PagedResponse<ExerciseDto>
        {
            Page     = page,
            PageSize = pageSize,
            Total    = totalUpstream, 
            Items    = pageItemsFinal
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
