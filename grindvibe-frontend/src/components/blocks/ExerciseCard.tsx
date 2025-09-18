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

type Props = {
  exercise: ExerciseDto;
  to?: string; 
};

export default function ExerciseCard({ exercise, to }: Props) {
  const primary: string[] = exercise.primaryMuscle ?? [];
  const secondary: string[] = exercise.secondaryMuscle ?? [];
  const equipment: string[] = exercise.equipment ?? [];

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]">
      {to && (
        <Link
          to={to}
          aria-label={`Open details of ${exercise.name}`}
          className="absolute inset-0 z-10"
        />
      )}

      <CardContent className="relative z-0 p-0">
        <div className="h-48 w-full overflow-hidden">
          {exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
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
          <h3 className="text-base font-semibold leading-tight">{exercise.name}</h3>

          {exercise.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {exercise.description}
            </p>
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
            <Button variant="outline" size="sm" className="cursor-pointer">
              Details
            </Button>

            {exercise.videoUrl ? (
              <button
                type="button"
                className="text-sm text-[var(--gv-accent)] underline-offset-4 hover:underline"
                onClick={(e) => {
                  e.stopPropagation(); // nie klikaj overlayu
                  window.open(exercise.videoUrl!, "_blank", "noopener,noreferrer");
                }}
              >
                Watch video
              </button>
            ) : (
              <span className="text-sm text-muted-foreground">No video</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
