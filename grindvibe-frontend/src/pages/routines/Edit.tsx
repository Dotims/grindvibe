import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Trash2, Save, ChevronLeft, ChevronRight, Plus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { ExerciseDto } from "../../api/exercises";
import { isApiError, type ApiError } from "../../api/client";
import { updateRoutine, getRoutine, getRoutineBySlug, type RoutineCreateDto } from "../../api/routines";

import {
//   addDay,
  addExerciseToDay,
  resetDraft,
  setDescription,
  setName,
  updateExercise,
  removeExercise,
  loadDraftFromApi,
  type DraftDay,
  type DraftExercise,
} from "../../features/routines/routinesSlice";

import { useExerciseSearch } from "../../hooks/useExerciseSearch";
import ExerciseTile from "../../components/routines/ExerciseTile";
import Num from "../../components/routines/Num";
import { ACCENT, parseMeta, writeMeta, type NotesMeta, type SetRow, type SetType } from "../../lib/routinesMeta";

export default function EditRoutinePage() {
  const { slug } = useParams<{ slug: string }>();
  const draft = useAppSelector((s) => s.routines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local state for the ID of the routine being edited
  const [routineId, setRoutineId] = useState<number | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  // Load original routine data
  useEffect(() => {
    if (!slug) return;
    const mounted = true;

    async function load() {
      try {
        setInitLoading(true);
        const isId = /^\d+$/.test(slug!);
        // Fetch data using ID or Slug
        const data = isId 
            ? await getRoutine(slug!) 
            : await getRoutineBySlug(slug!);
        
        if (mounted) {
            setRoutineId(data.id);
            dispatch(loadDraftFromApi(data));
        }
      } catch (err) {
        console.error("Failed to load routine", err);
        navigate('/routines');
      } finally {
        if (mounted) setInitLoading(false);
      }
    }
    load();
    
    // Cleanup draft on unmount
    return () => { dispatch(resetDraft()); };
  }, [slug, dispatch, navigate]);

  const day: DraftDay | undefined = draft.days[0];

  // Search logic
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;
  const { result, loading, totalPages } = useExerciseSearch(q, page, pageSize);

  // Save state
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [addedStamp, setAddedStamp] = useState<number>(0);

  const canSave = useMemo(
    () => draft.name.trim().length >= 2 && !!day && day.exercises.length > 0,
    [draft, day]
  );

  const onSave = async (): Promise<void> => {
    if (!day || !routineId) return;
    setError(null);
    setSaveLoading(true);
    try {
      const payload: RoutineCreateDto = {
        name: draft.name.trim(),
        description: draft.description ?? "",
        days: [
          {
            name: "Day 1",
            notes: "",
            exercises: day.exercises.map((e: DraftExercise) => ({
              exerciseId: e.exerciseId,
              order: e.order,
              targetSets: e.targetSets ?? null,
              targetRepsMin: e.targetRepsMin ?? null,
              targetRepsMax: e.targetRepsMax ?? null,
              targetRpe: e.targetRpe ?? null,
              restSeconds: e.restSeconds ?? null,
              notes: e.notes ?? null,
            })),
          },
        ],
      };

      // Call UPDATE instead of CREATE
      await updateRoutine(routineId, payload);
      
      dispatch(resetDraft());
      navigate('/routines'); 

    } catch (e: unknown) {
      console.error("Routine update failed:", e);
      if (isApiError(e)) {
        setError({ ...e, message: e.message || "Failed to update routine." });
      } else {
        setError({ status: 0, message: "Failed to update routine." });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // ... Helper functions (same as New.tsx) ...
  const addExercise = (x: ExerciseDto) => {
    if (!day) return;
    const meta: NotesMeta = {
      type: "normal",
      thumb: (x.videoUrl ?? x.imageUrl ?? null) && (x.videoUrl?.toLowerCase().endsWith(".gif") || x.imageUrl?.toLowerCase().endsWith(".gif"))
        ? (x.videoUrl ?? x.imageUrl ?? null)
        : (x.videoUrl ?? x.imageUrl ?? null),
      sets: [{ weight: null, repsMin: null, repsMax: null, rpe: null, restSeconds: null }],
    };
    dispatch(addExerciseToDay({
        dayId: day.id,
        exercise: {
          exerciseId: String(x.id),
          name: x.name,
          targetSets: null,
          targetRepsMin: null,
          targetRepsMax: null,
          targetRpe: null,
          restSeconds: null,
          notes: writeMeta(meta),
        },
      })
    );
    setAddedStamp(Date.now());
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setName(e.target.value));
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setDescription(e.target.value));
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setPage(1); setQ(e.target.value); };

  const addSet = (ex: DraftExercise) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    meta.sets.push({ weight: null, repsMin: null, repsMax: null, rpe: null, restSeconds: null });
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };
  const removeSet = (ex: DraftExercise, idx: number) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    if (meta.sets.length <= 1) return;
    meta.sets.splice(idx, 1);
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };
  const updateSetField = (ex: DraftExercise, idx: number, field: keyof SetRow, value: number | null) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    meta.sets[idx] = { ...meta.sets[idx], [field]: value };
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };
  const updateSetType = (ex: DraftExercise, type: SetType) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    meta.type = type;
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };

  if (initLoading) return <div className="p-10 text-center text-muted-foreground">Loading routine...</div>;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edytuj rutynę</h1>
          <p className="text-sm text-muted-foreground">Zmodyfikuj ćwiczenia i zestawy.</p>
        </div>
        <Button onClick={onSave} disabled={!canSave || saveLoading} className="gap-2 rounded-full cursor-pointer" style={{ backgroundColor: ACCENT }}>
          <Save className="h-4 w-4" />
          {saveLoading ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>

      {error && (
        <Notice kind="error">
          {error.message || "Nie udało się zapisać rutyny."}
          {error.detail ? ` (${error.detail})` : null}
        </Notice>
      )}

      {/* Name & Description */}
      <Card className="mb-6 rounded-2xl border border-border/40 bg-background/60 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)]">
        <CardContent className="p-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm mb-1 block">Nazwa</label>
            <Input value={draft.name} onChange={handleNameChange} placeholder="np. Push–Pull–Legs" />
          </div>
          <div>
            <label className="text-sm mb-1 block">Opis (opcjonalnie)</label>
            <Input value={draft.description ?? ""} onChange={handleDescChange} placeholder="Krótki opis" />
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* LEFT: Exercise Search */}
        <Card className="rounded-2xl border border-border/40 bg-background/60 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)] lg:col-span-2 lg:sticky lg:top-24 max-h-[70vh] overflow-auto">
          <CardContent className="p-4">
            <div className="mb-4">
              <label className="text-sm mb-1 block">Szukaj ćwiczeń</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                <Input placeholder="np. Wyciskanie na ławce..." className="pl-8" value={q} onChange={handleSearchChange} />
              </div>
            </div>

            {loading && (
              <div className="grid place-items-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Ładowanie...
              </div>
            )}

            {!loading && result && result.items.length === 0 && (
              <div className="grid place-items-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Brak wyników.
              </div>
            )}

            {!loading && result && result.items.length > 0 && (
              <>
                <div className="grid gap-3">
                  {result.items.map((it) => (
                    <ExerciseTile key={it.id} item={it} onAdd={addExercise} />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full h-8 w-8 cursor-pointer"
                    aria-label="Prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!result || page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-full h-8 w-8 cursor-pointer"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Routine Builder */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence initial={false}>
            {!day || day.exercises.length === 0 ? (
              <Card key="empty" className="rounded-2xl border border-dashed">
                <CardContent className="p-8 text-sm text-muted-foreground">Brak ćwiczeń. Kliknij kafelek po lewej, aby dodać.</CardContent>
              </Card>
            ) : (
              day.exercises.map((ex: DraftExercise, idx: number) => {
                const meta = parseMeta(ex.notes);
                const isLast = idx === day.exercises.length - 1;
                const shouldFlash = isLast && Date.now() - addedStamp < 1100;
                const img: string | null = meta.thumb ?? null;

                return (
                  <motion.div
                    key={ex.id}
                    initial={{ y: 8, opacity: 0, scale: 0.98 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      boxShadow: "0 10px 30px -12px rgba(0,0,0,0.35)",
                      filter: shouldFlash ? "drop-shadow(0 0 0 rgba(220,38,38,0))" : "none",
                    }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    exit={{ opacity: 0, height: 0, scale: 0.98, y: -6, filter: "blur(2px)" }}
                    className="relative rounded-2xl border border-border/40 bg-[color-mix(in_oklab,var(--gv-bg)_92%,#fff_8%)] overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 h-full w-[4px]" style={{ backgroundColor: ACCENT }} />

                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        {/* GIF */}
                        <div className="shrink-0 overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)] h-16 w-16 md:h-20 md:w-20">
                          {img ? (
                            <img src={img} alt={ex.name} className="h-full w-full object-contain" loading="lazy" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs opacity-70">GIF</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold leading-tight tracking-tight line-clamp-2" style={{ color: ACCENT }}>
                              {ex.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => dispatch(removeExercise({ dayId: day.id, exId: ex.id }))}
                              aria-label="Usuń ćwiczenie"
                              className="shrink-0 cursor-pointer"
                              title="Usuń ćwiczenie"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Set Type */}
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-6 gap-2">
                            <div className="col-span-2 sm:col-span-2">
                              <label className="text-xs block mb-1">Typ zestawu</label>
                              <div className="relative">
                                <select
                                  value={meta.type}
                                  onChange={(e) => updateSetType(ex, e.target.value as SetType)}
                                  className="gv-select h-9 w-full rounded-full border px-3 pr-10 text-sm appearance-none cursor-pointer"
                                >
                                  <option value="normal">Normalny</option>
                                  <option value="warmup">Rozgrzewka</option>
                                  <option value="dropset">Drop-set</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sets */}
                      <div className="mt-3 space-y-2">
                        <AnimatePresence initial={false}>
                          {meta.sets.map((s, sIdx) => (
                            <motion.div
                              key={`${ex.id}-set-${sIdx}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.18 }}
                              className="rounded-xl bg-[color-mix(in_oklab,var(--gv-bg)_85%,#fff_15%)] ring-1 ring-border/30 p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-medium" style={{ color: ACCENT }}>
                                  Zestaw #{sIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSet(ex, sIdx)}
                                  disabled={meta.sets.length <= 1}
                                  className="h-8 px-2 text-xs rounded-md hover:bg-accent/30 transition cursor-pointer disabled:opacity-50"
                                  title="Usuń zestaw"
                                >
                                  Usuń
                                </button>
                              </div>
                              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                                <Num label="Waga (kg)" value={s.weight ?? null} onChange={(v) => updateSetField(ex, sIdx, "weight", v)} placeholder="np. 60" />
                                <Num label="Powtórzenia MIN" value={s.repsMin ?? null} onChange={(v) => updateSetField(ex, sIdx, "repsMin", v)} placeholder="np. 8" />
                                <Num label="Powtórzenia MAX" value={s.repsMax ?? null} onChange={(v) => updateSetField(ex, sIdx, "repsMax", v)} placeholder="np. 12" />
                                <Num label="RPE" value={s.rpe ?? null} onChange={(v) => updateSetField(ex, sIdx, "rpe", v)} placeholder="np. 8" />
                                <Num label="Odpoczynek (s)" value={s.restSeconds ?? null} onChange={(v) => updateSetField(ex, sIdx, "restSeconds", v)} placeholder="np. 90" />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <div>
                          <button
                            type="button"
                            onClick={() => addSet(ex)}
                            className="mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm cursor-pointer transition"
                            style={{ borderColor: ACCENT, color: ACCENT }}
                          >
                            <Plus className="h-4 w-4" /> Dodaj zestaw
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}