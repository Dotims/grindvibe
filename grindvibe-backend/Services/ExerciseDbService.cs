using System.Text.Json;
using System.Web;
using grindvibe_backend.Models;

namespace grindvibe_backend.Services
{
    public class ExerciseDbService : IExerciseService
    {
        private readonly HttpClient _http;

        public ExerciseDbService(HttpClient http)
        {
            _http = http;
        }

        // search
        public async Task<PagedResponse<ExerciseDto>> SearchAsync(
            string? q, int page, int pageSize, CancellationToken ct = default)
        {
            var offset = Math.Max(0, (page - 1) * pageSize);
            var limit  = Math.Clamp(pageSize, 1, 25);

            var qs = HttpUtility.ParseQueryString(string.Empty);
            qs["q"]         = string.IsNullOrWhiteSpace(q) ? "" : q;
            qs["offset"]    = offset.ToString();
            qs["limit"]     = limit.ToString();
            qs["threshold"] = "0.3";

            var url = $"exercises/search?{qs}"; 

            var response = await _http.GetFromJsonAsync<ExerciseDbResponse>(url, ct);
            if (response is null)
                return new PagedResponse<ExerciseDto>();

            var items = response.data.Select(e => new ExerciseDto
            {
                Id               = e.exerciseId,
                Name             = e.name,
                PrimaryMuscles   = e.targetMuscles ?? new List<string>(),
                SecondaryMuscles = e.secondaryMuscles ?? new List<string>(),
                Equipment        = e.equipments ?? new List<string>(), 
                ImageUrl         = e.gifUrl,
                Description      = e.instructions is not null ? string.Join(" ", e.instructions) : null
            }).ToList();

            return new PagedResponse<ExerciseDto>
            {
                Page     = response.metadata.currentPage,
                PageSize = limit,
                Total    = response.metadata.totalExercises,
                Items    = items
            };
        }

        // lists
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


        // pobieranie surowego JSON-a z endpointu
        private async Task<string> GetRawAsync(string relativeUrl, CancellationToken ct)
        {
            var resp = await _http.GetAsync(relativeUrl, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);


            resp.EnsureSuccessStatusCode();
            return body;
        }

        // pasrsowanie listy nazw z roznych możliwych kształtów JSON-a
        private static List<string> ParseNames(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Array)
                return root.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).ToList();

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataEl))
            {
                if (dataEl.ValueKind == JsonValueKind.Array)
                {
                    if (dataEl.EnumerateArray().FirstOrDefault().ValueKind == JsonValueKind.String)
                        return dataEl.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).ToList();

                    return dataEl.EnumerateArray()
                        .Select(e => e.TryGetProperty("name", out var n) ? n.GetString() : null)
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .Cast<string>()
                        .ToList();
                }
            }

            throw new JsonException("Unexpected JSON shape for names list.");
        }
    }

    // DTOs dla odpowiedzi z ExerciseDB
    public class ExerciseDbResponse
    {
        public bool success { get; set; }
        public Metadata metadata { get; set; } = new();
        public List<ExerciseDbItem> data { get; set; } = new();
    }

    public class Metadata
    {
        public int totalExercises { get; set; }
        public int totalPages { get; set; }
        public int currentPage { get; set; }
    }

    // pojedyncze cwiczenie z ExerciseDB
    public class ExerciseDbItem
    {
        public string exerciseId { get; set; } = default!;
        public string name { get; set; } = default!;
        public string gifUrl { get; set; } = default!;
        public List<string>? targetMuscles { get; set; }
        public List<string>? secondaryMuscles { get; set; }
        public List<string>? equipments { get; set; }
        public List<string>? bodyParts { get; set; }
        public List<string>? instructions { get; set; }
    }
}