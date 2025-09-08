import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type Exercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  difficulty?: "Początkujący" | "Średnio-zaawansowany" | "Zaawansowany";
  imageUrl?: string | null;
  videoUrl?: string | null;
  description?: string;
};

function thumbGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${h2},70%,55%))`;
}

export default function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]">
      <CardContent className="p-0">
        <div className="h-48 w-full overflow-hidden">
          {ex.imageUrl ? (
            <img
              src={ex.imageUrl}
              alt={ex.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="h-full w-full grid place-items-center text-white font-semibold text-lg"
              style={{ background: thumbGradient(ex.name) }}
            >
              {ex.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold">{ex.name}</h3>
            {ex.difficulty && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                  ex.difficulty === "Początkujący" && "bg-emerald-500/15 text-emerald-600",
                  ex.difficulty === "Średnio-zaawansowany" && "bg-amber-500/15 text-amber-700",
                  ex.difficulty === "Zaawansowany" && "bg-red-500/15 text-red-600"
                )}
              >
                {ex.difficulty}
              </span>
            )}
          </div>

          {ex.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ex.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {ex.primaryMuscles.slice(0, 3).map((m) => (
              <span key={m} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                {m}
              </span>
            ))}
            {(ex.secondaryMuscles ?? []).slice(0, 2).map((m) => (
              <span key={m} className="rounded-md border px-2 py-0.5 text-xs">
                {m}
              </span>
            ))}
            {ex.equipment.slice(0, 2).map((e) => (
              <span key={e} className="rounded-md border px-2 py-0.5 text-xs">
                {e}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => alert(`(Mock) Open details for: ${ex.name}`)}
            >
              Details
            </Button>
            {ex.videoUrl ? (
              <a
                href={ex.videoUrl}
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
