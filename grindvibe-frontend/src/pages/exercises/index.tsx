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

function toApiError(e: unknown): ApiError {
  if (isApiError(e)) return e; // już jest ApiError

  // fetch przerwany → zwracamy neutralny
  if (e instanceof DOMException && e.name === "AbortError") {
    return { status: 0, message: "Aborted" };
  }

  // błąd jako string
  if (typeof e === "string") {
    return { status: 0, message: e };
  }

  // klasyczny Error albo obiekt z message
  if (e && typeof e === "object" && "message" in (e as Record<string, unknown>)) {
    const msg = (e as { message?: unknown }).message;
    return {
      status: 0,
      message: typeof msg === "string" ? msg : "Wystąpił błąd",
    };
  }

  // fallback – nieznany błąd
  return { status: 0, message: "Wystąpił błąd" };
}

export default function ExercisesPage() {
  // filtry ui
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

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
  const [page, setPage] = useState(1);
  const pageSize = 12;


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

    console.log("[ExercisesPage] state ->", { q, page, muscle, equipment });

    const t = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await searchExercises({
            q,
            page,
            pageSize,
            muscle: muscle ? [muscle] : [],
            equipment: equipment ? [equipment] : []
          });

          if (!alive) return;

          setItems(res.items);
          setTotal(res.total);
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
  }, [q, page, muscle, equipment]);

  const canPrev = page > 1;
  const canNext = items.length === pageSize && page * pageSize < total;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
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
              value={q}
              onChange={(e) => {
                setPage(1); 
                setQ(e.target.value);
              }}
              className="h-10 pl-8"
            />
          </div>

          <SimpleSelect
            value={muscle}
            onChange={(v) => {
              setPage(1); 
              setMuscle(v);
            }}
            options={muscleOptions}
            placeholder="Body part"
          />

          <SimpleSelect
            value={equipment}
            onChange={(v) => {
              setPage(1);
              setEquipment(v);
            }}
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
                to={`/exercise/${ex.id}`} 
              />
            ))}
          </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          {canPrev && (
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
              aria-label="Poprzednia strona"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <span className="flex min-w-[3rem] items-center justify-center rounded-full bg-muted/40 px-4 py-1.5 text-sm font-semibold text-foreground shadow-inner cursor-pointer">
            {page} / {total ? Math.ceil(total / pageSize) : 1}
          </span>

          {canNext && (
            <button
              onClick={() => setPage((p) => p + 1)}
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