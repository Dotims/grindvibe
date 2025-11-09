import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Trash2, Save } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Notice } from "../../components/ui/Notice";
import type { JSX } from "react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import type { RootState } from "../../store/store";

import type { ExerciseDto, SearchExercisesParams } from "../../api/exercises";
import { fetchAndCacheSearch, getCachedSearch } from "../../api/exercises";

import { isApiError, type ApiError } from "../../api/client";
import { createRoutine, type RoutineCreateDto } from "../../api/routines";


import {
  addDay,
  addExerciseToDay,
  removeDay,
  renameDay,
  resetDraft,
  setDescription,
  setName,
  updateExercise,
  removeExercise,
  type DraftDay,
  type DraftExercise,
} from "../../features/routines/routinesSlice";

// Simple numeric field with null support
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

export default function NewRoutinePage(): JSX.Element {
  // Draft state from Redux
  const draft = useAppSelector((s) => s.routines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local UI state
  const [q, setQ] = useState<string>("");
  const [results, setResults] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Search exercises (respects your SearchExercisesParams with string[] filters)
  useEffect(() => {
    const params: SearchExercisesParams = {
      q,
      page: 1,
      pageSize: 10,
      muscle: [],
      equipment: [],
    };

    const cached = getCachedSearch(params);
    if (cached) {
      setResults(cached.items);
      return;
    }

    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }

    const ctl = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await fetchAndCacheSearch(params, ctl.signal);
        setResults(res.items);
      } catch (err) {
        // Ignore abort errors; log others
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctl.abort();
  }, [q]);

  // Basic save guard: needs name and at least 1 exercise in any day
  const canSave = useMemo<boolean>(
    () => draft.name.trim().length >= 2 && draft.days.some((d: DraftDay) => d.exercises.length > 0),
    [draft]
  );

  // Persist routine
  const onSave = async (): Promise<void> => {
    setError(null);
    setSaveLoading(true);
    try {
      const payload: RoutineCreateDto = {
        name: draft.name.trim(),
        description: draft.description ?? "",
        days: draft.days.map((d: DraftDay) => ({
          name: d.name,
          notes: d.notes ?? "",
          exercises: d.exercises.map((e: DraftExercise) => ({
            exerciseId: e.exerciseId,
            order: e.order,
            targetSets: e.targetSets ?? null,
            targetRepsMin: e.targetRepsMin ?? null,
            targetRepsMax: e.targetRepsMax ?? null,
            targetRpe: e.targetRpe ?? null,
            restSeconds: e.restSeconds ?? null,
            notes: e.notes ?? null,
          })),
        })),
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

  // Handlers with explicit event types
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setName(e.target.value));
  };
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDescription(e.target.value));
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };
  const handleDayRename =
    (dayId: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch(renameDay({ dayId, name: e.target.value }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Nowa rutyna</h1>
          <p className="text-sm text-muted-foreground">Nazwij plan i dodaj ćwiczenia do dni.</p>
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
      <Card className="mb-6 rounded-2xl border bg-background/60">
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

      {/* Days */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dni treningowe</h2>
        <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => dispatch(addDay({}))}>
          <Plus className="h-4 w-4" /> Dodaj dzień
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {draft.days.map((d: DraftDay) => (
          <Card key={d.id} className="rounded-2xl border bg-background/60">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Input value={d.name} onChange={handleDayRename(d.id)} className="font-semibold" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(removeDay({ dayId: d.id }))}
                  aria-label="Usuń dzień"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Exercises in day */}
              <div className="space-y-3">
                {d.exercises.map((ex: DraftExercise) => (
                  <div key={ex.id} className="rounded-xl border p-3 bg-background/70">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{ex.name}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch(removeExercise({ dayId: d.id, exId: ex.id }))}
                        aria-label="Usuń ćwiczenie"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <NumberField
                        label="Serie"
                        value={ex.targetSets}
                        onChange={(v) =>
                          dispatch(updateExercise({ dayId: d.id, exId: ex.id, patch: { targetSets: v } }))
                        }
                      />
                      <NumberField
                        label="Powt. min"
                        value={ex.targetRepsMin}
                        onChange={(v) =>
                          dispatch(updateExercise({ dayId: d.id, exId: ex.id, patch: { targetRepsMin: v } }))
                        }
                      />
                      <NumberField
                        label="Powt. max"
                        value={ex.targetRepsMax}
                        onChange={(v) =>
                          dispatch(updateExercise({ dayId: d.id, exId: ex.id, patch: { targetRepsMax: v } }))
                        }
                      />
                      <NumberField
                        label="RPE"
                        value={ex.targetRpe}
                        onChange={(v) =>
                          dispatch(updateExercise({ dayId: d.id, exId: ex.id, patch: { targetRpe: v } }))
                        }
                      />
                      <NumberField
                        label="Przerwa (s)"
                        value={ex.restSeconds}
                        onChange={(v) =>
                          dispatch(updateExercise({ dayId: d.id, exId: ex.id, patch: { restSeconds: v } }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Exercise search for the day */}
              <div className="mt-4">
                <label className="text-sm mb-1 block">Dodaj ćwiczenie</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Szukaj ćwiczenia (EN)…"
                    className="pl-8"
                    value={q}
                    onChange={handleSearchChange}
                  />
                </div>

                {loading && <div className="mt-2 text-sm text-muted-foreground">Szukam…</div>}
                {!loading && q.trim().length >= 2 && results.length === 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">Brak wyników</div>
                )}

                {!loading && results.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {results.slice(0, 6).map((r: ExerciseDto) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          dispatch(
                            addExerciseToDay({
                              dayId: d.id,
                              exercise: {
                                exerciseId: String(r.id),
                                name: r.name,
                                targetSets: 3,
                                targetRepsMin: 8,
                                targetRepsMax: 12,
                                targetRpe: null,
                                restSeconds: 90,
                                notes: "",
                              },
                            })
                          )
                        }
                        className="text-left rounded-lg border px-3 py-2 hover:bg-accent/40 transition"
                      >
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.bodyPart ?? ""}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
