import { useMemo, useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
// import { Button } from "../../components/ui/button";
// import { cn } from "../../lib/utils";
import { Search } from "lucide-react";
import SimpleSelect from "../../components/blocks/SimpleSelect";
import ExerciseCard from "../../components/blocks/ExerciseCard";

type Exercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  difficulty?: "Początkujący" | "Średnio-zaawansowany" | "Zaawansowany";
  imageUrl?: string | null;
  videoUrl?: string | null;
  description?: string;
};

const MOCK: Exercise[] = [
  {
    id: "1",
    name: "Bench Press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    equipment: ["Barbell", "Bench"],
    difficulty: "Średnio-zaawansowany",
    imageUrl: "https://wger.de/media/exercise-images/26/Bench-press-1.png",
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    description: "Classic compound exercise targeting chest, triceps, and shoulders.",
  },
  {
    id: "2",
    name: "Pull Up",
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps"],
    equipment: ["Pull-up Bar"],
    difficulty: "Zaawansowany",
    imageUrl: "https://wger.de/media/exercise-images/44/Pull-ups-2.png",
    videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    description: "Bodyweight exercise for upper back and biceps strength.",
  },
  {
    id: "3",
    name: "Squat",
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    equipment: ["Barbell"],
    difficulty: "Początkujący",
    imageUrl: "https://wger.de/media/exercise-images/111/Squats-2.png",
    videoUrl: "https://www.youtube.com/watch?v=YaXPRqUwItQ",
    description: "Fundamental lower-body movement for strength and hypertrophy.",
  },
  {
    id: "4",
    name: "Plank",
    primaryMuscles: ["Abs"],
    secondaryMuscles: ["Lower Back"],
    equipment: ["Bodyweight"],
    difficulty: "Początkujący",
    imageUrl: "https://wger.de/media/exercise-images/130/Plank-1.png",
    description: "Isometric core exercise that builds endurance in abs and back.",
  },
];

export default function ExercisesPage() {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

  const [muscleOptions, setMuscleOptions] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch("https://localhost:7093/exercises/lists");
        if (!res.ok) throw new Error("Failed to fetch lists");
        const data = await res.json();
        setMuscleOptions(data.muscles);
        setEquipmentOptions(data.equipment);
      } catch (err) {
        console.error("Error fetching lists:", err);
      }
    };
    fetchLists();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return MOCK.filter((e) => {
      const byQ = !term || e.name.toLowerCase().includes(term);
      const inPrimary = e.primaryMuscles.map((m) => m.toLowerCase());
      const inSecondary = (e.secondaryMuscles ?? []).map((m) => m.toLowerCase());
      const byMuscle =
        !muscle ||
        inPrimary.includes(muscle.toLowerCase()) ||
        inSecondary.includes(muscle.toLowerCase());
      const byEquip =
        !equipment ||
        e.equipment.map((x) => x.toLowerCase()).includes(equipment.toLowerCase());
      return byQ && byMuscle && byEquip;
    });
  }, [q, muscle, equipment]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-muted-foreground">
            Przeglądaj ćwiczenia, filtruj po mięśniach i sprzęcie.
          </p>
        </div>

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
            placeholder="Muscle"
          />

          <SimpleSelect
            value={equipment}
            onChange={setEquipment}
            options={equipmentOptions}
            placeholder="Equipment"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Brak wyników dla wybranych filtrów.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex} />
          ))}
        </section>
      )}
    </main>
  );
}