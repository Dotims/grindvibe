import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { type ExerciseDto } from "../../api/exercises";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// gradient fallback (bez zmian)
function thumbGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1},75%,70%), hsl(${h2},75%,70%))`;
}

// [REMOVED] funkcja emojiForPart – usuwamy emotki z chipów

type Props = {
  exercise: ExerciseDto;
  to?: string;
};

export default function ExerciseCard({ exercise, to }: Props) {
  // guardy na dane
  const primary: string[] = exercise.primaryMuscle ?? [];
  const secondary: string[] = exercise.secondaryMuscle ?? [];
  const equipment: string[] = exercise.equipment ?? [];

  // preferujemy bodyPart; fallback: pierwszy primary
  const bodyPartLabel: string | null =
    (exercise.bodyPart?.trim() || null) ??
    (primary.find((s) => !!s && s.trim().length > 0)?.trim() ?? null);

  return (
    <motion.div
      initial={{ y: 0, opacity: 0.98 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 24, mass: 0.6 }}
      className="relative"
    >
      {to && (
        <Link
          to={to}
          aria-label={`Open details of ${exercise.name}`}
          // [CHANGED][FOCUS] wyłączamy ring/outline, aby nie było zielonego obramowania karty
          className="absolute inset-0 z-10 rounded-3xl outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
      )}

      <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-b from-white to-white/60 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] dark:from-zinc-900 dark:to-zinc-900/60 dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
        <CardContent className="p-0">
          <div className="h-44 w-full overflow-hidden bg-[rgba(0,0,0,0.03)]">
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
                className="grid h-full w-full place-items-center text-xl font-semibold text-white"
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
            <div className="mb-2 flex items-center gap-2">
              {bodyPartLabel && (
                // [CHANGED] sam label bodyPart – bez emotek, bez dodatkowego ring-a
                <span className="inline-flex items-center rounded-full bg-[color(display-p3_0.95_0.98_0.90)] px-2.5 py-1 text-[11px] font-medium text-[color(display-p3_0.18_0.55_0.25)]">
                  {bodyPartLabel}
                </span>
              )}
              {equipment[0] && (
                <span className="inline-flex items-center rounded-full bg-[color(display-p3_0.96_0.96_1)] px-2.5 py-1 text-[11px] font-medium text-[color(display-p3_0.30_0.38_0.75)]">
                  {equipment[0]}
                </span>
              )}
            </div>

            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
              {exercise.name}
            </h3>

            {exercise.description && (
              <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground/90">
                {exercise.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {primary.slice(0, 3).map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[color(display-p3_0.97_0.98_1)] px-2.5 py-0.5 text-[11px] text-[color(display-p3_0.25_0.35_0.70)]"
                >
                  {m}
                </span>
              ))}
              {secondary.slice(0, 2).map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-transparent px-2.5 py-0.5 text-[11px] text-foreground/70 ring-1 ring-foreground/10"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-none select-none rounded-full border-0 bg-[color(display-p3_0.98_0.99_1)] text-[12px] font-semibold text-[color(display-p3_0.25_0.35_0.70)] shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
              >
                Details
              </Button>
              <span className="text-[11px] text-muted-foreground/70">Tap card</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
