import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import SimpleSelect from "../../components/blocks/SimpleSelect";
import { type ExerciseDto, getExerciseLists, searchExercises } from "../../api/exercises";
import ExerciseCard from "../../components/blocks/ExerciseCard";

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
    const t = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await searchExercises({ q, page, pageSize });
          if (!alive) return;
          setItems(res.items);
          setTotal(res.total);
        } catch {
          if (alive) setError("Nie udało się pobrać ćwiczeń");
        } finally {
          if (alive) setLoading(false);
        }
      })();
    }, 300);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, page]);

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
                setPage(1); // przy zmianie zapytania wróć na pierwszą stronę
                setQ(e.target.value);
              }}
              className="h-10 pl-8"
            />
          </div>

          <SimpleSelect
            value={muscle}
            onChange={(v) => {
              setPage(1); // paginacja od nowa po zmianie filtra
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

      {listsLoading && <div className="mb-4 text-sm text-muted-foreground">Loading filters…</div>}
      {listsError && <div className="mb-4 text-sm text-red-600">Failed to load filters: {listsError}</div>}

      {/* Wyniki */}
      {loading && <div className="mb-4 text-sm text-muted-foreground">Loading exercises…</div>}
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Brak wyników.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ex) => (
              <Link key={ex.id} to={`/exercises/${ex.id}`}>
                <ExerciseCard exercise={ex} />
              </Link>
            ))}
          </div>

          {/* Paginacja */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page}
              {total ? ` / ${Math.ceil(total / pageSize)}` : ""}
            </span>
            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}