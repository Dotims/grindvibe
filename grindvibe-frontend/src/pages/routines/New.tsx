import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Save, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import type { ExerciseDto, SearchExercisesParams, PagedResult } from "../../api/exercises";
import { fetchAndCacheSearch, getCachedSearch } from "../../api/exercises";

import { isApiError, type ApiError } from "../../api/client";
import { createRoutine, type RoutineCreateDto } from "../../api/routines";

import {
  addDay,
  addExerciseToDay,
  resetDraft,
  setDescription,
  setName,
  updateExercise,
  removeExercise,
  type DraftDay,
  type DraftExercise,
} from "../../features/routines/routinesSlice";

/* ---------- Helpers: per-exercise meta stored in notes JSON ---------- */
type SetType = "normal" | "warmup" | "dropset";
type SetRow = { weight: number | null; reps: number | null; rpe?: number | null; restSeconds?: number | null };
type NotesMeta = { type: SetType; sets: SetRow[] };

// tolerant parser: supports legacy "type:..." string
function parseMeta(notes?: string | null): NotesMeta {
  if (!notes) return { type: "normal", sets: [{ weight: null, reps: null, rpe: null, restSeconds: null }] };
  try {
    const obj = JSON.parse(notes) as Partial<NotesMeta>;
    const type: SetType = (obj.type as SetType) ?? "normal";
    const sets = Array.isArray(obj.sets) && obj.sets.length > 0
      ? obj.sets.map(s => ({
          weight: s?.weight ?? null,
          reps: s?.reps ?? null,
          rpe: s?.rpe ?? null,
          restSeconds: s?.restSeconds ?? null,
        }))
      : [{ weight: null, reps: null, rpe: null, restSeconds: null }];
    return { type, sets };
  } catch {
    const m = notes.match(/type:(normal|warmup|dropset)/i);
    const type: SetType = ((m?.[1]?.toLowerCase() as SetType) ?? "normal");
    return { type, sets: [{ weight: null, reps: null, rpe: null, restSeconds: null }] };
  }
}
function writeMeta(meta: NotesMeta): string {
  return JSON.stringify(meta);
}

/* ---------- Small numeric input ---------- */
function Num({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === "" ? null : Number(raw));
  };
  return (
    <div>
      <label className="text-xs block mb-1">{label}</label>
      <Input type="number" value={value ?? ""} onChange={handle} placeholder={placeholder} className="h-9" />
    </div>
  );
}

/* ---------- Exercise tile (left column) ---------- */
function ExerciseTile({ item, onAdd }: { item: ExerciseDto; onAdd: (e: ExerciseDto) => void }) {
  const body =
    item.bodyPart || item.primaryMuscles?.[0] || (item.secondaryMuscles?.[0] ?? "Exercise");
  const initials = item.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd(item)}
      className="group w-full text-left cursor-pointer rounded-2xl border border-border/60
                 bg-[color-mix(in_oklab,var(--gv-bg)_88%,#fff_12%)]
                 hover:bg-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                 transition shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)] p-3"
      aria-label={`Add ${item.name}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--gv-bg)_75%,#fff_25%)] grid place-items-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="text-xs font-semibold opacity-80">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium leading-tight line-clamp-2">{item.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{body}</div>
        </div>
      </div>
      <div className="mt-2 text-[12px] font-medium text-[color(display-p3_0.35_0.60_1)] opacity-90">
        Kliknij, aby dodać
      </div>
    </motion.button>
  );
}

/* ---------- Page ---------- */
export default function NewRoutinePage() {
  const draft = useAppSelector((s) => s.routines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ensure "Day 1" exists
  useEffect(() => {
    if (!draft.days || draft.days.length === 0) {
      dispatch(addDay({ name: "Day 1" }));
    }
  }, [dispatch, draft.days]);

  const day: DraftDay | undefined = draft.days[0];

  // browse/search
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [result, setResult] = useState<PagedResult<ExerciseDto> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // save/error
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // flash on add
  const [addedStamp, setAddedStamp] = useState<number>(0);

  // load list
  useEffect(() => {
    const params: SearchExercisesParams = { q, page, pageSize, muscle: [], equipment: [] };
    const cached = getCachedSearch(params);
    if (cached) {
      setResult(cached);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const res = await fetchAndCacheSearch(params, ctl.signal);
        setResult(res);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [q, page, pageSize]);

  const canSave = useMemo(
    () => draft.name.trim().length >= 2 && !!day && day.exercises.length > 0,
    [draft, day]
  );

  const onSave = async (): Promise<void> => {
    if (!day) return;
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
              notes: e.notes ?? null, // contains JSON meta with sets
            })),
          },
        ],
      };
      const saved = await createRoutine(payload);
      dispatch(resetDraft());
      navigate(`/routines/${saved.id}`);
    } catch (e: unknown) {
      if (isApiError(e)) setError(e);
      else setError({ status: 0, message: "Failed to save routine." });
    } finally {
      setSaveLoading(false);
    }
  };

  // add exercise with default meta (1 set)
  const addExercise = (x: ExerciseDto) => {
    if (!day) return;
    const meta: NotesMeta = { type: "normal", sets: [{ weight: null, reps: null, rpe: null, restSeconds: null }] };
    dispatch(
      addExerciseToDay({
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

  // field handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName && dispatch(setName(e.target.value));
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setDescription(e.target.value));
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setPage(1); setQ(e.target.value); };

  // set operations
  const addSet = (ex: DraftExercise) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    meta.sets.push({ weight: null, reps: null, rpe: null, restSeconds: null });
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };
  const removeSet = (ex: DraftExercise, idx: number) => {
    if (!day) return;
    const meta = parseMeta(ex.notes);
    if (meta.sets.length <= 1) return; // keep at least 1
    meta.sets.splice(idx, 1);
    dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: writeMeta(meta) } }));
  };
  const updateSetField = (
    ex: DraftExercise,
    idx: number,
    field: keyof SetRow,
    value: number | null
  ) => {
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

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Nowa rutyna</h1>
          <p className="text-sm text-muted-foreground">
            Dodawaj ćwiczenia i konfiguruj serie (waga, powtórzenia, RPE, przerwy).
          </p>
        </div>
        <Button onClick={onSave} disabled={!canSave || saveLoading} className="gap-2 rounded-full">
          <Save className="h-4 w-4" />
          {saveLoading ? "Zapisuję…" : "Zapisz"}
        </Button>
      </div>

      {error && (
        <Notice kind="error">
          {error.message}
          {error.detail ? ` (${error.detail})` : null}
        </Notice>
      )}

      {/* Meta */}
      <Card className="mb-6 rounded-2xl border bg-background/60 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)]">
        <CardContent className="p-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm mb-1 block">Nazwa</label>
            <Input value={draft.name} onChange={handleNameChange} placeholder="np. Push–Pull–Legs" />
          </div>
          <div>
            <label className="text-sm mb-1 block">Opis (opcjonalnie)</label>
            <Input value={draft.description ?? ""} onChange={handleDescChange} placeholder="Krótki opis planu" />
          </div>
        </CardContent>
      </Card>

      {/* 2/5 : 3/5 layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT (2/5) */}
        <Card className="rounded-2xl border bg-background/60 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)] lg:col-span-2 lg:sticky lg:top-24 max-h-[70vh] overflow-auto">
          <CardContent className="p-4">
            <div className="mb-4">
              <label className="text-sm mb-1 block">Szukaj ćwiczenia</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                <Input placeholder="np. Bench press…" className="pl-8" value={q} onChange={handleSearchChange} />
              </div>
            </div>

            {loading && (
              <div className="grid place-items-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Ładowanie ćwiczeń…
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
                    className="rounded-full h-8 w-8"
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
                    className="rounded-full h-8 w-8"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RIGHT (3/5) */}
        <Card className="rounded-2xl border bg-background/60 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)] lg:col-span-3">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Ćwiczenia w rutynie</h2>

            {!day || day.exercises.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Brak ćwiczeń. Kliknij kafelek po lewej, aby dodać.
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {day.exercises.map((ex: DraftExercise, idx: number) => {
                    const meta = parseMeta(ex.notes);
                    const isLast = idx === day.exercises.length - 1;
                    const shouldFlash = isLast && Date.now() - addedStamp < 1200;

                    return (
                      <motion.div
                        key={ex.id}
                        initial={shouldFlash ? { backgroundColor: "rgba(80,160,255,0.15)" } : { opacity: 1 }}
                        animate={{ backgroundColor: "rgba(0,0,0,0)", opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: shouldFlash ? 0.8 : 0.2, ease: "easeOut" }}
                        className="rounded-xl border p-3 bg-background/70"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium line-clamp-2">{ex.name}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => dispatch(removeExercise({ dayId: day.id, exId: ex.id }))}
                              aria-label="Usuń ćwiczenie"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Series type */}
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                            <div className="col-span-2 sm:col-span-2">
                              <label className="text-xs block mb-1">Typ serii</label>
                              <select
                                value={meta.type}
                                onChange={(e) => updateSetType(ex, e.target.value as SetType)}
                                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                              >
                                <option value="normal">Normal</option>
                                <option value="warmup">Warm-up</option>
                                <option value="dropset">Drop-set</option>
                              </select>
                            </div>
                          </div>

                          {/* Sets list */}
                          <div className="mt-1 space-y-2">
                            <AnimatePresence initial={false}>
                              {meta.sets.map((s, sIdx) => (
                                <motion.div
                                  key={`${ex.id}-set-${sIdx}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="rounded-lg border bg-background/60 p-3"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-70">Seria #{sIdx + 1}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSet(ex, sIdx)}
                                      disabled={meta.sets.length <= 1}
                                      className="h-8 px-2 text-xs"
                                    >
                                      Usuń
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <Num
                                      label="Ciężar (kg)"
                                      value={s.weight ?? null}
                                      onChange={(v) => updateSetField(ex, sIdx, "weight", v)}
                                      placeholder="np. 60"
                                    />
                                    <Num
                                      label="Powtórzenia"
                                      value={s.reps ?? null}
                                      onChange={(v) => updateSetField(ex, sIdx, "reps", v)}
                                      placeholder="np. 8"
                                    />
                                    <Num
                                      label="RPE"
                                      value={s.rpe ?? null}
                                      onChange={(v) => updateSetField(ex, sIdx, "rpe", v)}
                                      placeholder="np. 8"
                                    />
                                    <Num
                                      label="Przerwa (s)"
                                      value={s.restSeconds ?? null}
                                      onChange={(v) => updateSetField(ex, sIdx, "restSeconds", v)}
                                      placeholder="np. 90"
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSet(ex)}
                                className="mt-1 gap-2 rounded-full !pr-4"
                              >
                                <Plus className="h-4 w-4" /> Dodaj serię
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
