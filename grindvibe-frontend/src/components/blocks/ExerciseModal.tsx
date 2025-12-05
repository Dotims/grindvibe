import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "../../components/ui/dialog"; 
import { X } from "lucide-react";
import type { ExerciseDto } from "../../api/exercises";
import { parseExerciseSteps } from "../../lib/utils";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exercise: ExerciseDto | null;
}

export default function ExerciseModal({ open, onOpenChange, exercise }: Props) {
  if (!exercise) return null;
  const steps = parseExerciseSteps(exercise.description ?? null);

  const primary = exercise.primaryMuscles ?? [];
  const secondary = exercise.secondaryMuscles ?? [];
  const equipment = exercise.equipment ?? [];
  const instructions = exercise.instructions ?? [];
  const bodyPart = exercise.bodyPart ?? null;

  const chipPrimary =
  "inline-flex items-center rounded-full bg-secondary text-secondary-foreground " +
  "px-2.5 py-0.5 text-[11px] font-medium";

  const chipSecondary =
    "inline-flex items-center rounded-full bg-transparent px-2.5 py-0.5 text-[11px] " +
    "text-foreground/70 ring-1 ring-border";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-[min(96vw,1000px)] p-0 overflow-hidden rounded-2xl
          bg-card text-card-foreground border border-border shadow-2xl
          data-[state=open]:animate-in
          supports-[backdrop-filter]:bg-card
        "
        aria-describedby={undefined}
      >
        <div className="relative px-6 pt-5 pb-3">
          <DialogTitle className="pr-10 text-xl font-semibold tracking-tight">
            {exercise.name}
          </DialogTitle>
          <DialogClose
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full
                      border border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground transition"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="relative bg-muted/40">
            <div className="relative aspect-square md:aspect-square lg:aspect-square">
              {exercise.videoUrl ? (
                <video
                  src={exercise.videoUrl}
                  className="absolute inset-0 h-full w-full object-contain bg-[var(--gv-bg)]"
                  autoPlay muted loop playsInline
                />
              ) : exercise.imageUrl ? (
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="absolute inset-0 h-full w-full object-contain bg-[var(--gv-bg)]"
                  loading="lazy"
                  fetchPriority="low"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                  Brak podglądu
                </div>
              )}
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {bodyPart && (
                <span className={chipPrimary}>
                  {bodyPart}
                </span>
              )}
              {equipment.map((e) => (
                <span
                  key={e}
                  className={chipSecondary}
                >
                  {e}
                </span>
              ))}
              {exercise.difficulty && (
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Poziom: {exercise.difficulty}
                </span>
              )}
            </div>

            {steps.length > 0 ? (
              <ol className="mt-2 ml-5 list-decimal space-y-1 text-[13px] text-muted-foreground/90">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : (
              exercise.description && (
                <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground/90">
                  {exercise.description}
                </p>
              )
            )}

            {(primary.length > 0 || secondary.length > 0) && (
              <div className="mb-4 space-y-1.5 text-sm">
                {primary.length > 0 && (
                  <div className="mt-[22px]">
                    <span className="font-semibold">Główne mięśnie: </span>
                    <span className="text-muted-foreground">
                      {primary.join(", ")}
                    </span>
                  </div>
                )}
                {secondary.length > 0 && (
                  <div>
                    <span className="font-semibold">Dodatkowe: </span>
                    <span className="text-muted-foreground">
                      {secondary.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {instructions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Instrukcje</h3>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1.5">
                  {instructions.map((step, i) => (
                    <li key={i} className="leading-relaxed break-words">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
