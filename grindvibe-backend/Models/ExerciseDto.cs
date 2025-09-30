namespace grindvibe_backend.Models
{
    // DTO returned to the frontend
    public class ExerciseDto
    {
        public string Id { get; set; } = default!;
        public string Name { get; set; } = default!;

        // muscles & equipment
        public List<string> PrimaryMuscles { get; set; } = new();
        public List<string> SecondaryMuscles { get; set; } = new();
        public List<string> Equipment { get; set; } = new();

        // taxonomy / meta
        public string? BodyPart { get; set; }
        public string? Difficulty { get; set; }

        // media & description
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? Description { get; set; }

        // step-by-step instructions
        public List<string>? instructions { get; set; }
    }

    // Generic paged response wrapper
    public class PagedResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public List<T> Items { get; set; } = new();
    }
}
