import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
// import { Button } from "../../components/ui/button";
// import { cn } from "../../lib/utils";
import { Search } from "lucide-react";
import SimpleSelect from "../../components/blocks/SimpleSelect";
import { getExerciseLists } from "../../api/exercises";

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getExerciseLists();
        if (!alive) return;

        setMuscleOptions(data.muscles ?? []);
        setEquipmentOptions(data.equipment ?? []);
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-muted-foreground">
            Przeglądaj ćwiczenia z ExerciseDB. Na razie ładujemy listy filtrów; wyszukiwanie podepniemy w kolejnym kroku.
          </p>
        </div>

        {/* filtry */}
        <div className="grid w-full grid-cols-1 gap-2 md:w-auto md:grid-cols-[minmax(260px,360px)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
            <Input
              placeholder="Search by name (EN)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 pl-8"
            />
          </div>

          <SimpleSelect
            value={muscle}
            onChange={setMuscle}
            options={muscleOptions}
            placeholder="Body part"
          />

          <SimpleSelect
            value={equipment}
            onChange={setEquipment}
            options={equipmentOptions}
            placeholder="Equipment"
          />
        </div>
      </div>

      {listsLoading && (
        <div className="mb-4 text-sm text-muted-foreground">Loading filters…</div>
      )}
      {listsError && (
        <div className="mb-4 text-sm text-red-600">Failed to load filters: {listsError}</div>
      )}

      <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        test
      </div>
    </main>
  );
}