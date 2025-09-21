using static grindvibe_backend.Services.Filtering.Normalizer;
using System.Linq;
using System.Collections.Generic;
using grindvibe_backend.Models;                 
namespace grindvibe_backend.Services.Filtering
{
    public static class ExerciseFilter
    {
        public static IEnumerable<ExerciseDto> Apply(
            IEnumerable<ExerciseDto> source,
            IEnumerable<string> bodyParts,
            IEnumerable<string> equipments)
        {
            var query = source ?? Enumerable.Empty<ExerciseDto>();

            var requestedParts = bodyParts
                .Select(NormCanon)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToArray();

            if (requestedParts.Length > 0)
            {
                query = query.Where(e =>
                {
                    var actual = NormCanon(e.BodyPart);
                    if (string.IsNullOrEmpty(actual)) return false;

                    return requestedParts.Any(req =>
                        actual == req ||
                        actual.Contains(req) ||
                        req.Contains(actual));
                });
            }

            var requestedEquip = equipments
                .Select(NormCanon)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            if (requestedEquip.Count > 0)
            {
                query = query.Where(e =>
                    (e.Equipment ?? new List<string>())
                        .Select(NormCanon)
                        .Any(eq => requestedEquip.Contains(eq)));
            }

            return query;
        }
    }
}
