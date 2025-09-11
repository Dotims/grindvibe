using grindvibe_backend.Models;

namespace grindvibe_backend.Services
{
    public interface IExerciseService
    {
        // metody ktory musi miec serwis od cwiczen 
        Task<PagedResponse<ExerciseDto>> SearchAsync(string? q, int page, int pageSize, CancellationToken ct = default);

        // pobieranie partie ciala + sprzetu
        Task<List<string>> GetAllBodypartsAsync(CancellationToken ct = default);
        Task<List<string>> GetAllEquipmentsAsync(CancellationToken ct = default);
    }
}