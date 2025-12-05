using System.ComponentModel.DataAnnotations;

namespace grindvibe_backend.Models;

public class Routine
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    // URL-friendly identifier
    [MaxLength(250)]
    public string Slug { get; set; } = ""; 

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public List<RoutineDay> Days { get; set; } = new();
}

public class RoutineDay
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = "";

    public string? Notes { get; set; }

    public int RoutineId { get; set; }
    public Routine Routine { get; set; } = default!;

    public List<RoutineExercise> Exercises { get; set; } = new();
}

public class RoutineExercise
{
    public int Id { get; set; }

    [Required]
    public string ExerciseId { get; set; } = "";

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    public int Order { get; set; }
    public int? TargetSets { get; set; }
    public int? TargetRepsMin { get; set; }
    public int? TargetRepsMax { get; set; }
    public int? TargetRpe { get; set; }
    public int? RestSeconds { get; set; }
    public string? Notes { get; set; }

    public int RoutineDayId { get; set; }
    public RoutineDay RoutineDay { get; set; } = default!;
}