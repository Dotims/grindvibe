using System.Net.Http.Json;
using System.Web;
using grindvibe_backend.Models;

namespace grindvibe_backend.Services
{
    public interface IExerciseDbService
    {
        Task<PagedResponse<ExerciseDto>> SearchAsync(
            string? q, int page, int pageSize, CancellationToken ct = default);

        Task<List<String>> GetAllBodyPartsAsync(CancellationToken ct = default);
        Task<List<String>> GetAllEquipmentsAsync(CancellationToken ct = default);
    }

    public class ExerciseDbService : IExerciseService
    {
        private readonly HttpClient _http;

        public ExerciseDbService(HttpClient http)
        {
            _http = http;
            // baza dla wszystkich endpointow
            _http.BaseAddress = new Uri("https://www.exercisedb.dev/api/v1");
        }

        public async Task<PagedResponse<ExerciseDto>> SearchAsync(string? q, int page, int pageSize, CancellationToken ct = default)
        {
            var offset = Math.Max(0, (page - 1) * pageSize);
            var limit = Math.Clamp(pageSize, 1, 25);

            var qs = HttpUtility.ParseQueryString(string.Empty);
            qs["q"] = string.IsNullOrWhiteSpace(q) ? "all" : q;
            qs["offset"] = offset.ToString();
            qs["limit"] = limit.ToString();
            qs["threshold"] = "0.3";

            var url = $"/exercises/search?{qs}";

            var response = await _http.GetFromJsonAsync<ExerciseDbResponse>(url, ct);
            if (response == null) return new PagedResponse<ExerciseDto>();

            var items = response.data.Select(e => new ExerciseDto
            {
                Id = e.exerciseId,
                Name = e.name,
                PrimaryMuscles = e.targetMuscles?.ToList() ?? new(),
                SecondaryMuscles = e.secondaryMuscles?.ToList() ?? new(),
                Equipment = e.equipment?.ToList() ?? new(),
                ImageUrl = e.gifUrl,
                Description = e.instructions != null ? string.Join(" ", e.instructions) : null
            }).ToList();

            return new PagedResponse<ExerciseDto>
            {
                Page = response.metadata.currentPage,
                PageSize = limit,
                Total = response.metadata.totalExercises,
                Items = items
            };
        }

        public async Task<List<string>> GetAllBodypartsAsync(CancellationToken ct = default)
        {
            var data = await _http.GetFromJsonAsync<List<string>>("/bodyparts", ct);
            return data ?? new();
        }

        public async Task<List<string>> GetAllEquipmentsAsync(CancellationToken ct = default)
        {
            var data = await _http.GetFromJsonAsync<List<string>>("/equipments", ct);
            return data ?? new();
        }
    }
    
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

    public class ExerciseDbItem
    {
        public string exerciseId { get; set; } = default!;
        public string name { get; set; } = default!;
        public string gifUrl { get; set; } = default!;
        public List<string>? targetMuscles { get; set; }
        public List<string>? secondaryMuscles { get; set; }
        public List<string>? equipment { get; set; }
        public List<string>? instructions { get; set; }
    }
}