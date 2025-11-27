import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Calendar, Dumbbell, Clock, X } from "lucide-react"; // Added X icon
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";
import { getRoutineBySlug, getRoutine } from "../../api/routines";
import { parseMeta, ACCENT } from "../../lib/routinesMeta";

// Type definition for the API response
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
  const { slug } = useParams<{ slug: string }>();
  const [routine, setRoutine] = useState<RoutineDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    console.log("[RoutineDetails] Mounted with slug:", slug); // DEBUG

    async function load() {
      try {
        setLoading(true);
        
        let data;

        // Sprawdzamy czy slug to liczba (stare ID) czy tekst (nowy slug)
        const isId = /^\d+$/.test(slug!);
        console.log("[RoutineDetails] isId:", isId); // DEBUG
        
        if (isId) {
             data = await getRoutine(slug!) as unknown as RoutineDetailsDto;
        } else {
             data = await getRoutineBySlug(slug!) as unknown as RoutineDetailsDto;
        }

        console.log("[RoutineDetails] Loaded data:", data); // DEBUG

        if (mounted) setRoutine(data);
      } catch (err) {
        console.error("[RoutineDetails] Error loading routine:", err); // DEBUG
        if (mounted) setError("Nie udało się załadować rutyny.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading...</div>;

  if (error || !routine) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Notice kind="error">{error || "Routine not found."}</Notice>
        <Button variant="link" asChild className="mt-4 pl-0">
          <Link to="/routines">← Back to list</Link>
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
          Back to list
        </Link>
        
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{routine.name}</h1>
            {routine.description && (
              <p className="mt-2 text-lg text-muted-foreground">{routine.description}</p>
            )}
          </div>
          <Button className="rounded-full" style={{ backgroundColor: ACCENT }}>
            Start Workout
          </Button>
        </div>
      </div>

      {/* Days & Exercises */}
      <div className="space-y-10">
        
        {/* --- DODAJ TO --- */}
        {(!routine.days || routine.days.length === 0) && (
           <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/50 rounded-3xl bg-muted/5 text-center">
             <Dumbbell className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
             <h3 className="text-lg font-semibold">Pusto tutaj</h3>
             <p className="text-muted-foreground max-w-xs mx-auto mt-2">
               Ta rutyna nie ma zapisanych żadnych ćwiczeń. Prawdopodobnie wystąpił błąd podczas jej tworzenia.
             </p>
             <Button variant="outline" className="mt-6" asChild>
               <Link to="/routines">Wróć do listy</Link>
             </Button>
           </div>
        )}
        {/* ---------------- */}

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
                        
                        {/* Image Thumbnail - Added onClick and cursor styles */}
                        <div 
                          className={`shrink-0 bg-muted/30 sm:w-32 sm:border-r border-border/50 grid place-items-center p-2 transition-colors ${img ? "cursor-zoom-in hover:bg-muted/50" : ""}`}
                          onClick={() => img && setPreviewImage(img)}
                        >
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
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                {ex.restSeconds}s rest
                              </div>
                            )}
                          </div>

                          {/* Sets Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="text-xs text-muted-foreground border-b border-border/30">
                                  <th className="pb-2 font-medium w-12">Set</th>
                                  <th className="pb-2 font-medium">Kg</th>
                                  <th className="pb-2 font-medium">Reps</th>
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

      {/* Full Screen Image Preview Overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[999] grid place-items-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            {/* Close button */}
            <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
              <X className="h-6 w-6" />
            </button>

            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}