using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Web;
using grindvibe_backend.Models;

namespace grindvibe_backend.Services
{
    public class ExerciseDbService : IExerciseService
    {
        private readonly HttpClient _http;
        private readonly ILogger<ExerciseDbService> _log;

        public ExerciseDbService(HttpClient http, ILogger<ExerciseDbService> log)
        {
            _http = http;
            _log = log;
        }

        // LIST / SEARCH 
        public async Task<PagedResponse<ExerciseDto>> SearchAsync(
            string? q, int page, int pageSize, CancellationToken ct = default)
        {
            var limit  = Math.Clamp(pageSize, 1, 25);
            var offset = Math.Max(0, (page - 1) * limit);

            var qs = HttpUtility.ParseQueryString(string.Empty);
            qs["limit"]  = limit.ToString();
            qs["offset"] = offset.ToString();
            if (!string.IsNullOrWhiteSpace(q)) qs["search"] = q.Trim();

            var url = $"exercises?{qs}";
            _log.LogInformation("UPSTREAM → {Url}", url);

            var resp = await _http.GetFromJsonAsync<ExercisesResponse>(url, ct);
            if (resp is null || resp.data is null) return new PagedResponse<ExerciseDto>();

            var items = resp.data.Select(MapToDto).ToList();

            return new PagedResponse<ExerciseDto>
            {
                Page     = resp.metadata?.currentPage ?? page,
                PageSize = limit,
                Total    = resp.metadata?.totalExercises ?? items.Count,
                Items    = items
            };
        }

        // DICTIONARY
        public async Task<List<string>> GetAllBodypartsAsync(CancellationToken ct = default)
        {
            var json = await GetRawAsync("bodyparts", ct);
            return ParseNames(json);
        }

        public async Task<List<string>> GetAllEquipmentsAsync(CancellationToken ct = default)
        {
            var json = await GetRawAsync("equipments", ct);
            return ParseNames(json);
        }

        // EXERCISE DESCRIPTION
        public async Task<ExerciseDto?> GetByIdAsync(string id, CancellationToken ct = default)
        {
            var url = $"exercises/{id}";
            using var resp = await _http.GetAsync(url, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound) return null;
            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("data", out var data)) return null;

            return new ExerciseDto
            {
                Id          = data.GetProperty("exerciseId").GetString() ?? id,
                Name        = data.GetProperty("name").GetString() ?? "",
                ImageUrl    = data.TryGetProperty("gifUrl", out var gif) ? gif.GetString() : null,
                Description = null,
                PrimaryMuscles   = data.TryGetProperty("targetMuscles", out var tm)
                    ? tm.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList()
                    : new(),
                SecondaryMuscles = data.TryGetProperty("secondaryMuscles", out var sm)
                    ? sm.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList()
                    : new(),
                Equipment        = data.TryGetProperty("equipments", out var eq)
                    ? eq.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList()
                    : new(),
                instructions     = data.TryGetProperty("instructions", out var instr)
                    ? instr.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrWhiteSpace(x)).ToList()
                    : null,
                BodyPart         = data.TryGetProperty("bodyParts", out var bps) && bps.ValueKind == JsonValueKind.Array
                    ? bps.EnumerateArray().Select(x => x.GetString() ?? "").FirstOrDefault(s => !string.IsNullOrWhiteSpace(s))?.Trim()
                    : null
            };
        }

        // FILTR: BODY PART 
        public async Task<PagedResponse<ExerciseDto>> GetByBodyPartAsync(
            string bodyPart, int page, int pageSize, CancellationToken ct = default)
        {
            var limit  = Math.Clamp(pageSize, 1, 25);
            var offset = Math.Max(0, (page - 1) * limit);

            var qs = HttpUtility.ParseQueryString(string.Empty);
            qs["limit"]  = limit.ToString();
            qs["offset"] = offset.ToString();
            if (!string.IsNullOrWhiteSpace(bodyPart)) qs["bodyParts"] = bodyPart.Trim();

            var url = $"exercises/filter?{qs}";
            _log.LogInformation("UPSTREAM → {Url}", url);

            var resp = await _http.GetFromJsonAsync<ExercisesResponse>(url, ct);
            if (resp is null || resp.data is null) return new PagedResponse<ExerciseDto>();

            var items = resp.data.Select(MapToDto).ToList();

            return new PagedResponse<ExerciseDto>
            {
                Page     = resp.metadata?.currentPage ?? page,
                PageSize = limit,
                Total    = resp.metadata?.totalExercises ?? items.Count,
                Items    = items
            };
        }

        // FILTR: EQUIPMENT 
        public async Task<PagedResponse<ExerciseDto>> GetByEquipmentAsync(
            string equipment, int page, int pageSize, CancellationToken ct = default)
        {
            var limit  = Math.Clamp(pageSize, 1, 25);
            var offset = Math.Max(0, (page - 1) * limit);

            var qs = HttpUtility.ParseQueryString(string.Empty);
            qs["limit"]  = limit.ToString();
            qs["offset"] = offset.ToString();
            if (!string.IsNullOrWhiteSpace(equipment)) qs["equipment"] = equipment.Trim();

            var url = $"exercises/filter?{qs}";
            _log.LogInformation("UPSTREAM → {Url}", url);

            var resp = await _http.GetFromJsonAsync<ExercisesResponse>(url, ct);
            if (resp is null || resp.data is null) return new PagedResponse<ExerciseDto>();

            var items = resp.data.Select(MapToDto).ToList();

            return new PagedResponse<ExerciseDto>
            {
                Page     = resp.metadata?.currentPage ?? page,
                PageSize = limit,
                Total    = resp.metadata?.totalExercises ?? items.Count,
                Items    = items
            };
        }

        // HELPERS
        private async Task<string> GetRawAsync(string relativeUrl, CancellationToken ct)
        {
            using var resp = await _http.GetAsync(relativeUrl, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound) return "[]";
            resp.EnsureSuccessStatusCode();
            return await resp.Content.ReadAsStringAsync(ct);
        }

        private static List<string> ParseNames(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataEl))
            {
                if (dataEl.ValueKind == JsonValueKind.Array)
                {
                    var first = dataEl.EnumerateArray().FirstOrDefault();
                    if (first.ValueKind == JsonValueKind.String)
                        return dataEl.EnumerateArray()
                                     .Select(e => e.GetString() ?? "")
                                     .Where(s => !string.IsNullOrWhiteSpace(s))
                                     .ToList();

                    return dataEl.EnumerateArray()
                                 .Select(e => e.TryGetProperty("name", out var n) ? n.GetString() : null)
                                 .Where(s => !string.IsNullOrWhiteSpace(s))
                                 .Cast<string>()
                                 .ToList();
                }
            }

            // sometimes API return empty string array
            if (root.ValueKind == JsonValueKind.Array)
                return root.EnumerateArray()
                           .Select(e => e.GetString() ?? "")
                           .Where(s => !string.IsNullOrWhiteSpace(s))
                           .ToList();

            throw new JsonException("Unexpected JSON shape for names list.");
        }

        private static ExerciseDto MapToDto(ExerciseItem e) => new ExerciseDto
        {
            Id               = e.exerciseId,
            Name             = e.name,
            Equipment        = e.equipments ?? new(),
            BodyPart         = e.bodyParts?.FirstOrDefault(),
            PrimaryMuscles   = e.targetMuscles ?? new(),
            SecondaryMuscles = e.secondaryMuscles ?? new(),
            ImageUrl         = e.gifUrl,
            Description      = null,
            instructions     = e.instructions
        };
    }

    public class ExercisesResponse
    {
        public bool success { get; set; }
        public Metadata? metadata { get; set; } 
        public List<ExerciseItem> data { get; set; } = new();
    }

    public class Metadata
    {
        public int    totalExercises { get; set; }
        public int    totalPages     { get; set; }
        public int    currentPage    { get; set; }
        public string? previousPage  { get; set; }
        public string? nextPage      { get; set; }
    }

    public class ExerciseItem
    {
        public string        exerciseId       { get; set; } = default!;
        public string        name             { get; set; } = default!;
        public string?       gifUrl           { get; set; }           
        public List<string>? targetMuscles    { get; set; }
        public List<string>? bodyParts        { get; set; }
        public List<string>? equipments       { get; set; }
        public List<string>? secondaryMuscles { get; set; }
        public List<string>? instructions     { get; set; }
    }
}
