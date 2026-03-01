import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Notice } from "../../components/ui/Notice";
import { getExerciseById, type ExerciseDto } from "../../api/exercises";
import { parseExerciseSteps } from "../../lib/utils";

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();

  const [exercise, setExercise] = useState<ExerciseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getExerciseById(id);
        if (mounted) {
          setExercise(data);
          setError(null);
        }
      } catch (err) {
        console.error("[ExerciseDetail] Error loading exercise:", err);
        if (mounted) setError("Nie udało się załadować ćwiczenia.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">Ładowanie…</div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Notice kind="error">{error || "Nie znaleziono ćwiczenia."}</Notice>
        <Button variant="link" asChild className="mt-4 pl-0">
          <Link to="/exercises">← Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  const steps = parseExerciseSteps(exercise.description ?? null);
  const primary = exercise.primaryMuscles ?? [];
  const secondary = exercise.secondaryMuscles ?? [];
  const equipment = exercise.equipment ?? [];
  const instructions = exercise.instructions ?? [];
  const bodyPart = exercise.bodyPart ?? null;

  const chipPrimary =
    "inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-medium";
  const chipSecondary =
    "inline-flex items-center rounded-full bg-transparent px-2.5 py-0.5 text-[11px] text-foreground/70 ring-1 ring-border";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Back link */}
      <Link
        to="/exercises"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Wróć do listy
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-4">{exercise.name}</h1>

      {/* Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {bodyPart && <span className={chipPrimary}>{bodyPart}</span>}
        {equipment.map((e) => (
          <span key={e} className={chipSecondary}>{e}</span>
        ))}
        {exercise.difficulty && (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
            Poziom: {exercise.difficulty}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Media */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/40 border border-border/50">
          {exercise.videoUrl ? (
            <video
              src={exercise.videoUrl}
              className="absolute inset-0 h-full w-full object-contain bg-[var(--gv-bg)]"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="absolute inset-0 h-full w-full object-contain bg-[var(--gv-bg)]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              Brak podglądu
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Description / Steps */}
          {steps.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Opis</h2>
              <ol className="ml-5 list-decimal space-y-1 text-sm text-muted-foreground/90">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ) : (
            exercise.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Opis</h2>
                <p className="text-sm text-muted-foreground/90">{exercise.description}</p>
              </div>
            )
          )}

          {/* Muscles */}
          {(primary.length > 0 || secondary.length > 0) && (
            <div className="space-y-1.5 text-sm">
              {primary.length > 0 && (
                <div>
                  <span className="font-semibold">Główne mięśnie: </span>
                  <span className="text-muted-foreground">{primary.join(", ")}</span>
                </div>
              )}
              {secondary.length > 0 && (
                <div>
                  <span className="font-semibold">Dodatkowe: </span>
                  <span className="text-muted-foreground">{secondary.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Instrukcje</h2>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1.5">
                {instructions.map((step, i) => (
                  <li key={i} className="leading-relaxed break-words">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}