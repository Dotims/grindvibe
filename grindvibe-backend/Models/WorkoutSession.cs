using System.ComponentModel.DataAnnotations;

namespace grindvibe_backend.Models;

public class WorkoutSession
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    // Nullable because a workout might be ad-hoc (not based on a routine)
    public int? RoutineId { get; set; }
    public Routine? Routine { get; set; }

    public string Name { get; set; } = ""; // e.g. "Push Day - Morning"
    
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public List<WorkoutSet> Sets { get; set; } = new();
}

public class WorkoutSet
{
    public int Id { get; set; }

    public int WorkoutSessionId { get; set; }
    
    [Required]
    public string ExerciseId { get; set; } = ""; // Link to Exercise DB
    public string ExerciseName { get; set; } = "";

    public int SetNumber { get; set; }
    
    // Actual values logged by user
    public double? Weight { get; set; }
    public int? Reps { get; set; }
    public double? Rpe { get; set; }
    
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}