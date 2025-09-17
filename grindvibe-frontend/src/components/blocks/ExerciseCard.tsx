import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { type ExerciseDto } from "../../api/exercises";
import { Link } from "react-router-dom";

function thumbGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${h2},70%,55%))`;
}

export default function ExerciseCard({ exercise }: { exercise: ExerciseDto }) {
  const primary: string[] = exercise.primaryMuscle ?? [];
  const secondary: string[] = exercise.secondaryMuscle ?? [];
  const equipment: string[] = exercise.equipment ?? [];

  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]">
      <CardContent className="p-0">
        <div className="h-48 w-full overflow-hidden">
          {exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-lg font-semibold text-white"
              style={{ background: thumbGradient(exercise.name) }}
            >
              {exercise.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
        </div>

        <div className="p-4">


          {exercise.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exercise.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {primary.slice(0, 3).map((m) => (
              <span key={m} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                {m}
              </span>
            ))}
            {secondary.slice(0, 2).map((m) => (
              <span key={m} className="rounded-md border px-2 py-0.5 text-xs">
                {m}
              </span>
            ))}
            {equipment.slice(0, 2).map((e) => (
              <span key={e} className="rounded-md border px-2 py-0.5 text-xs">
                {e}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            {/* ✅ Zamiast alertu — link do szczegółu */}
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link to={`/exercises/${exercise.id}`}>Details</Link>
            </Button>

            {exercise.videoUrl ? (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--gv-accent)] underline-offset-4 hover:underline"
              >
                Watch video
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">No video</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
