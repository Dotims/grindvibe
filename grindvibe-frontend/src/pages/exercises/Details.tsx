import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Dodano useNavigate
import { ChevronLeft, Calendar, Dumbbell, Clock, Play } from "lucide-react"; // Dodano Play
import { motion } from "framer-motion";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";
import { getRoutine } from "../../api/routines";
import { parseMeta, ACCENT } from "../../lib/routinesMeta";

// Importy Redux do obsługi treningu
import { useAppDispatch } from "../../store/hooks";
import { startWorkout, type ActiveExercise } from "../../features/workout/workoutSlice";

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
      notes?: string;
      restSeconds?: number;
    }>;
  }>;
};

export default function RoutineDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Hook nawigacji
  const dispatch = useAppDispatch(); // Hook Reduxa

  const [routine, setRoutine] = useState<RoutineDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        // Fetch data from backend
        const data = await getRoutine(id!) as unknown as RoutineDetailsDto;
        if (mounted) setRoutine(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Nie udało się załadować szczegółów rutyny.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleStartWorkout = () => {
    if (!routine) return;

    // 1. Mapowanie struktury rutyny na strukturę aktywnego treningu
    const activeExercises: ActiveExercise[] = [];
    
    routine.days.forEach(day => {
      day.exercises.forEach(ex => {
        const meta = parseMeta(ex.notes);
        
        activeExercises.push({
          id: crypto.randomUUID(),
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: meta.sets.map((s, idx) => ({
            id: crypto.randomUUID(),
            setNumber: idx + 1,
            targetWeight: s.weight,
            targetRepsMin: s.repsMin,
            targetRepsMax: s.repsMax,
            targetRpe: s.rpe,
            restSeconds: s.restSeconds,
            actualWeight: s.weight ? String(s.weight) : "", // Pre-fill wagi jeśli jest w planie
            actualReps: "",
            actualRpe: "",
            completed: false
          }))
        });
      });
    });

    // 2. Wysłanie akcji do Reduxa (rozpoczęcie treningu)
    dispatch(startWorkout({
      routineId: routine.id,
      routineName: routine.name,
      exercises: activeExercises
    }));

    // 3. Przekierowanie na stronę treningu
    navigate('/workout/active');
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Ładowanie...</div>;

  if (error || !routine) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Notice kind="error">{error || "Rutyna nie znaleziona."}</Notice>
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
        
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{routine.name}</h1>
            {routine.description && (
              <p className="mt-2 text-lg text-muted-foreground">{routine.description}</p>
            )}
          </div>
          
          {/* Przycisk Start Workout */}
          <Button 
            size="lg"
            className="rounded-full gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer" 
            style={{ backgroundColor: ACCENT }}
            onClick={handleStartWorkout}
          >
            <Play className="h-4 w-4 fill-current" />
            Rozpocznij trening
          </Button>
        </div>
      </div>

      {/* Days & Exercises */}
      <div className="space-y-10">
        
        {(!routine.days || routine.days.length === 0) && (
           <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/50 rounded-3xl bg-muted/5 text-center">
             <Dumbbell className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
             <h3 className="text-lg font-semibold">Pusto tutaj</h3>
             <p className="text-muted-foreground max-w-xs mx-auto mt-2">
               Ta rutyna nie ma zapisanych żadnych ćwiczeń.
             </p>
             <Button variant="outline" className="mt-6" asChild>
               <Link to="/routines">Wróć do listy</Link>
             </Button>
           </div>
        )}

        {(routine.days || []).map((day) => (
          <section key={day.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Calendar className="h-5 w-5 text-[var(--gv-accent)]" />
              <h2 className="text-xl font-semibold">{day.name}</h2>
            </div>

            <div className="grid gap-4">
              {day.exercises.map((ex, idx) => {
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
                        {/* Image */}
                        <div className="shrink-0 bg-muted/30 sm:w-32 sm:border-r border-border/50 grid place-items-center p-2">
                          {img ? (
                            <img src={img} alt={ex.name} className="h-20 w-20 object-contain" loading="lazy" />
                          ) : (
                            <Dumbbell className="h-8 w-8 opacity-20" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="font-semibold text-lg">{ex.name}</h3>
                            {ex.restSeconds && (
                              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                <Clock className="h-3 w-3" />
                                {ex.restSeconds}s przerwy
                              </div>
                            )}
                          </div>

                          {/* Sets Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="text-muted-foreground border-b border-border/30 text-xs uppercase tracking-wider">
                                  <th className="pb-2 font-medium w-12">Seria</th>
                                  <th className="pb-2 font-medium">Kg</th>
                                  <th className="pb-2 font-medium">Powtórzenia</th>
                                  <th className="pb-2 font-medium">RPE</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/10">
                                {meta.sets.map((s, i) => (
                                  <tr key={i}>
                                    <td className="py-2 text-muted-foreground text-xs">{i + 1}</td>
                                    <td className="py-2 font-medium">{s.weight ?? "—"}</td>
                                    <td className="py-2">{s.repsMin && s.repsMax ? `${s.repsMin}-${s.repsMax}` : (s.repsMin ?? "—")}</td>
                                    <td className="py-2 text-muted-foreground">{s.rpe ?? "—"}</td>
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
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}