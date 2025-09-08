using Microsoft.AspNetCore.Mvc;

namespace grindvibe_backend.Controllers;

[ApiController]
[Route("exercises")]
public class ExercisesController : ControllerBase
{
    [HttpGet("lists")]
    public IActionResult GetList()
    {
        var data = new
        {
            muscles = new[]
            {
                "All",
                "Abs",
                "Back",
                "Biceps",
                "Chest",
                "Glutes",
                "Hamstrings",
                "Lower Back",
                "Quadriceps",
                "Shoulders",
                "Triceps"
            },
            equipment = new[]
            {
                "All",
                "Barbell",
                "Bench",
                "Bodyweight",
                "Pull-up Bar"
            }
        };

        return Ok(data);
    }
}
