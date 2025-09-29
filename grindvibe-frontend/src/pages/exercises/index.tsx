import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import SimpleSelect from "../../components/blocks/SimpleSelect";
import { type ExerciseDto, getExerciseLists, searchExercises } from "../../api/exercises";
import ExerciseCard from "../../components/blocks/ExerciseCard";
import { Notice } from "../../components/ui/Notice";
import type { ApiError } from "../../api/client";
import { isApiError } from "../../api/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExerciseModal from "../../components/blocks/ExerciseModal";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectExercisesFilters, selectQueryParams } from "../../features/exercises/exerciseFilters.selectors";
import { setEquipment, setMuscle, setPage, setQ } from "../../features/exercises/exercisesFiltersSlice";


function toApiError(e: unknown): ApiError {
  if (isApiError(e)) return e; 


  if (e instanceof DOMException && e.name === "AbortError") {
    return { status: 0, message: "Aborted" };
  }

  if (typeof e === "string") {
    return { status: 0, message: e };
  }

  if (e && typeof e === "object" && "message" in (e as Record<string, unknown>)) {
    const msg = (e as { message?: unknown }).message;
    return {
      status: 0,
      message: typeof msg === "string" ? msg : "Wystąpił błąd",
    };
  }

  return { status: 0, message: "Wystąpił błąd" };
}

export default function ExercisesPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseDto | null>(null);
 
  // opcje do dropdownow
  const [muscleOptions, setMuscleOptions] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);

  // stany ux dla fetchowania list
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);

  // lista cwiczen
  const [items, setItems] = useState<ExerciseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectExercisesFilters); 
  const query   = useAppSelector(selectQueryParams);  

  const canPrev = filters.page > 1;
  const canNext = items.length === filters.pageSize && filters.page * filters.pageSize < total;

  useEffect(() => {
    let alive = true;    
    (async () => {
      try {
        const data = await getExerciseLists();
        if (!alive) return;

        setMuscleOptions(data.muscles ?? []);
        setEquipmentOptions(data.equipments ?? []);
        setListsError(null);
      } catch (err) {
        if (!alive) return;
        setListsError((err as Error)?.message ?? "Failed to load filters");
      } finally {
        if (alive) setListsLoading(false);
      }
    })();
    return () => { alive = false };
  }, []);


  useEffect(() => {
    let alive = true;
    console.log("[ExercisesPage] query ->", query);

    const t = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await searchExercises(query);

          if (!alive) return;

          setItems(res.items);
          setTotal(res.total);
          console.log("[EXERCISES] received:", res.items?.length ?? 0, "total:", res.total);
        } catch (e) {
          if (alive) setError(toApiError(e));
        } finally {
          if (alive) setLoading(false);
        }
      })();
    }, 300);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);


  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-muted-foreground">
            Odkryj ćwiczenia dopasowane do Twoich celów i znajdź inspirację na każdy trening.
          </p>
        </div>

        {/* filtry */}
        <div className="grid w-full grid-cols-1 gap-2 md:w-auto md:grid-cols-[minmax(260px,360px)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
            <Input
              placeholder="Search by name (EN)…"
              value={filters.q}
              onChange={(e) => dispatch(setQ(e.target.value))}
              className="h-10 pl-8"
            />
          </div>

          <SimpleSelect
            value={filters.muscle}
            onChange={(v) => dispatch(setMuscle(v))}
            options={muscleOptions}
            placeholder="Body part"
          />

          <SimpleSelect
            value={filters.equipment}
            onChange={(v) => { dispatch(setEquipment(v))}}
            options={equipmentOptions}
            placeholder="Equipment"
          />
        </div>
      </div>

      {listsLoading && <Notice>Ładowanie filtrów…</Notice>}
      {listsError && (
        <Notice kind="error">Nie udało się wczytać filtrów. Spróbuj ponownie.</Notice>
      )}

      {loading && <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Ładowanie ćwiczeń…
      </div>}

      {error && (
        error && error.status === 429
          ? <Notice kind="warn">Zbyt wiele zapytań. Odczekaj chwilę i spróbuj ponownie.</Notice>
          : <Notice kind="error">Nie udało się pobrać ćwiczeń. {error.message && <span>({error.message})</span>}</Notice>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Brak wyników.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onClick={() => { setSelected(ex); setOpen(true); }}
              />
            ))}
          </div>
          <ExerciseModal open={open} onOpenChange={setOpen} exercise={selected} />


        <div className="mt-10 flex items-center justify-center gap-4">
          
          {canPrev && (
            <button
              onClick={() => dispatch(setPage(filters.page - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
              aria-label="Poprzednia strona"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <span className="flex min-w-[3rem] items-center justify-center rounded-full bg-muted/40 px-4 py-1.5 text-sm font-semibold text-foreground shadow-inner cursor-pointer">
            {filters.page} / {total ? Math.ceil(total / filters.pageSize) : 1}
          </span>

          {canNext && (
            <button
              onClick={() => dispatch(setPage(filters.page + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground cursor-pointer"
              aria-label="Następna strona"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        </>
      )}
    </main>
  );
}