namespace grindvibe_backend.Models
{
    public class ExerciseDto
    {
        public string Id { get; set; } = default!;
        public string Name { get; set; } = default!;
        public List<string> PrimaryMuscles { get; set; } = new();
        public List<string> SecondaryMuscles { get; set; } = new();
        public List<string> Equipment { get; set; } = new();
        public string? BodyPart { get; set; }
        public string? Difficulty { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? Description { get; set; }
        public List<string>? instructions { get; set; }
    }

    public class PagedResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public List<T> Items { get; set; } = new();
    }
}