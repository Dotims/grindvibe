import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Dumbbell, Clock } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";
import { getRoutine } from "../../api/routines";
import { parseMeta, ACCENT } from "../../lib/routinesMeta";

// Type definitions match what your backend returns in GetById
type RoutineDetailsDto = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  days: Array<{
    id: number;
    name: string;
    notes?: string;
    exercises: Array<{
      id: number;
      exerciseId: string;
      name: string;
      order: number;
      notes?: string; // JSON with sets
      restSeconds?: number;
    }>;
  }>;
};

export default function RoutineDetails() {
  const { id } = useParams<{ id: string }>();
  const [routine, setRoutine] = useState<RoutineDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        // getRoutine uses api(), which returns any/generic
        const data = await getRoutine(id!) as unknown as RoutineDetailsDto;
        if (mounted) setRoutine(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Nie udało się pobrać szczegółów rutyny.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Ładowanie planu...
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Notice kind="error">{error || "Nie znaleziono rutyny."}</Notice>
        <Button variant="link" asChild className="mt-4 pl-0">
          <Link to="/routines">← Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Header */}
      <div className="mb-8">
        <Link to="/routines" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Wróć do listy
        </Link>
        
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{routine.name}</h1>
            {routine.description && (
              <p className="mt-2 text-lg text-muted-foreground">{routine.description}</p>
            )}
          </div>
          {/* "Edit" or "Start Workout" button */}
          <Button className="rounded-full" style={{ backgroundColor: ACCENT }}>
            Rozpocznij trening
          </Button>
        </div>
      </div>

      {/* Training days */}
      <div className="space-y-8">
        {routine.days.map((day) => (
          <section key={day.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Calendar className="h-5 w-5 text-[var(--gv-accent)]" />
              <h2 className="text-xl font-semibold">{day.name}</h2>
            </div>

            <div className="grid gap-4">
              {day.exercises.map((ex, idx) => {
                // Parse JSON from notes field to retrieve sets
                const meta = parseMeta(ex.notes);
                const img = meta.thumb;

                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[color-mix(in_oklab,var(--gv-bg)_95%,#fff_5%)]">
                      <CardContent className="p-0 sm:flex">
                        {/* Image / GIF */}
                        <div className="shrink-0 bg-muted/30 sm:w-32 sm:border-r border-border/50 grid place-items-center p-2">
                          {img ? (
                            <img src={img} alt={ex.name} className="h-20 w-20 object-contain" loading="lazy" />
                          ) : (
                            <Dumbbell className="h-8 w-8 opacity-20" />
                          )}
                        </div>

                        {/* Description */}
                        <div className="flex-1 p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="font-semibold text-lg">{ex.name}</h3>
                            {ex.restSeconds && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                {ex.restSeconds}s przerwy
                              </div>
                            )}
                          </div>

                          {/* Sets table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="text-xs text-muted-foreground border-b border-border/30">
                                  <th className="pb-2 font-medium w-12">Seria</th>
                                  <th className="pb-2 font-medium">Typ</th>
                                  <th className="pb-2 font-medium">Ciężar</th>
                                  <th className="pb-2 font-medium">Powtórzenia</th>
                                  <th className="pb-2 font-medium">RPE</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/10">
                                {meta.sets.map((s, i) => (
                                  <tr key={i} className="group">
                                    <td className="py-2 text-muted-foreground text-xs">{i + 1}</td>
                                    <td className="py-2">
                                      {meta.type === "warmup" ? <span className="text-yellow-500 text-xs">Rozgrz.</span> : 
                                       meta.type === "dropset" ? <span className="text-red-500 text-xs">Drop</span> : 
                                       <span className="opacity-50 text-xs">Normal</span>}
                                    </td>
                                    <td className="py-2 font-medium">
                                      {s.weight ? `${s.weight} kg` : "—"}
                                    </td>
                                    <td className="py-2">
                                      {s.repsMin && s.repsMax 
                                        ? `${s.repsMin} - ${s.repsMax}` 
                                        : (s.repsMin ?? s.repsMax ?? "—")}
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                      {s.rpe ?? "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {day.exercises.length === 0 && (
                <div className="text-sm text-muted-foreground italic pl-2">Brak ćwiczeń w tym dniu.</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}