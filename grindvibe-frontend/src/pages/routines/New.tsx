import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react";
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

// Numeric field with null support
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number | null;
  onChange: (v: number | null) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === "" ? null : Number(raw));
  };
  return (
    <div>
      <label className="text-xs block mb-1">{label}</label>
      <Input type="number" value={value ?? ""} onChange={handleChange} className="h-9" />
    </div>
  );
}

// Set type encoded in notes
type SetType = "normal" | "warmup" | "dropset";
const parseSetType = (notes?: string | null): SetType => {
  if (!notes) return "normal";
  const m = notes.match(/type:(normal|warmup|dropset)/i);
  return (m?.[1]?.toLowerCase() as SetType) || "normal";
};
const writeSetType = (notes: string | null | undefined, t: SetType): string => {
  const base = (notes ?? "").replace(/type:(normal|warmup|dropset)/gi, "").trim();
  return [base, `type:${t}`].filter(Boolean).join(" ").trim();
};

// Small tile with thumbnail + add on click
function ExerciseTile({
  item,
  onAdd,
}: { item: ExerciseDto; onAdd: (e: ExerciseDto) => void }) {
  const body =
    item.bodyPart ||
    item.primaryMuscles?.[0] ||
    (item.secondaryMuscles?.[0] ?? "Exercise");

  const initials = item.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

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
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
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

export default function NewRoutinePage() {
  // Draft (ensure at least one day)
  const draft = useAppSelector((s) => s.routines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!draft.days || draft.days.length === 0) {
      dispatch(addDay({ name: "Day 1" }));
    }
  }, [dispatch, draft.days]);

  const day: DraftDay | undefined = draft.days[0];

  // Search + browse state
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [result, setResult] = useState<PagedResult<ExerciseDto> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Save + error
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Flash animation for last added entry
  const [addedStamp, setAddedStamp] = useState<number>(0);

  // Load/browse exercises
  useEffect(() => {
    const params: SearchExercisesParams = {
      q,
      page,
      pageSize,
      muscle: [],
      equipment: [],
    };

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
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctl.abort();
  }, [q, page, pageSize]);

  // Can save
  const canSave = useMemo(
    () => draft.name.trim().length >= 2 && !!day && day.exercises.length > 0,
    [draft, day]
  );

  // Save routine
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
              notes: e.notes ?? null,
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

  // Add exercise with defaults + trigger flash
  const addExercise = (x: ExerciseDto) => {
    if (!day) return;
    dispatch(
      addExerciseToDay({
        dayId: day.id,
        exercise: {
          exerciseId: String(x.id),
          name: x.name,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetRpe: null,
          restSeconds: 90,
          notes: "type:normal",
        },
      })
    );
    setAddedStamp(Date.now());
  };

  // Field handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setName(e.target.value));
  };
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDescription(e.target.value));
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setQ(e.target.value);
  };

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Nowa rutyna</h1>
          <p className="text-sm text-muted-foreground">
            Dodawaj ćwiczenia z listy lub wyszukaj. Ustaw serie, powtórzenia, RPE i typ serii.
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
            <Input
              value={draft.description ?? ""}
              onChange={handleDescChange}
              placeholder="Krótki opis planu"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2/5 : 3/5 layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT (2/5): browse + search */}
        <Card className="rounded-2xl border bg-background/60 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)] lg:col-span-2 lg:sticky lg:top-24 max-h-[70vh] overflow-auto">
          <CardContent className="p-4">
            <div className="mb-4">
              <label className="text-sm mb-1 block">Szukaj ćwiczenia</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                <Input
                  placeholder="np. Bench press…"
                  className="pl-8"
                  value={q}
                  onChange={handleSearchChange}
                />
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

                {/* Pager */}
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

        {/* RIGHT (3/5): current routine */}
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
                    const currentType = parseSetType(ex.notes);
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

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-6 gap-2">
                          <NumberField
                            label="Serie"
                            value={ex.targetSets}
                            onChange={(v) =>
                              dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { targetSets: v } }))
                            }
                          />
                          <NumberField
                            label="Powt. min"
                            value={ex.targetRepsMin}
                            onChange={(v) =>
                              dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { targetRepsMin: v } }))
                            }
                          />
                          <NumberField
                            label="Powt. max"
                            value={ex.targetRepsMax}
                            onChange={(v) =>
                              dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { targetRepsMax: v } }))
                            }
                          />
                          <NumberField
                            label="RPE"
                            value={ex.targetRpe}
                            onChange={(v) =>
                              dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { targetRpe: v } }))
                            }
                          />
                          <NumberField
                            label="Przerwa (s)"
                            value={ex.restSeconds}
                            onChange={(v) =>
                              dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { restSeconds: v } }))
                            }
                          />
                          <div>
                            <label className="text-xs block mb-1">Typ serii</label>
                            <select
                              value={currentType}
                              onChange={(e) => {
                                const next = writeSetType(ex.notes, e.target.value as SetType);
                                dispatch(updateExercise({ dayId: day.id, exId: ex.id, patch: { notes: next } }));
                              }}
                              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                            >
                              <option value="normal">Normal</option>
                              <option value="warmup">Warm-up</option>
                              <option value="dropset">Drop-set</option>
                            </select>
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
