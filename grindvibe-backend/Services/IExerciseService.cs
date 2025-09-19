using grindvibe_backend.Models;

namespace grindvibe_backend.Services
{
    public interface IExerciseService
    {
        // wyszukiwanie cwiczen
        Task<PagedResponse<ExerciseDto>> SearchAsync(string? q, int page, int pageSize, CancellationToken ct = default);

        // listy do filtrow
        Task<List<string>> GetAllBodypartsAsync(CancellationToken ct = default);
        Task<List<string>> GetAllEquipmentsAsync(CancellationToken ct = default);

        // szczegoly cwiczenia
        Task<ExerciseDto?> GetByIdAsync(string id, CancellationToken ct = default);

        // filtrowanie
        Task<PagedResponse<ExerciseDto>> GetByBodyPartAsync(string bodyPart, int page, int pageSize, CancellationToken ct = default);
        Task<PagedResponse<ExerciseDto>> GetByEquipmentAsync(string equipment, int page, int pageSize, CancellationToken ct = default);


    }
}