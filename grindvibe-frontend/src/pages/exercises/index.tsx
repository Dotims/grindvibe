import { useMemo, useState, Fragment } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check, Search } from "lucide-react";

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

const ALL_MUSCLES = Array.from(
  new Set(MOCK.flatMap((e) => [...e.primaryMuscles, ...(e.secondaryMuscles ?? [])]))
).sort();
const ALL_EQUIP = Array.from(new Set(MOCK.flatMap((e) => e.equipment))).sort();

function thumbGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${h2},70%,55%))`;
}

function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn("relative", className)}>
        <Listbox.Button
          className="
            w-full h-10 rounded-md border border-[var(--gv-border)]
            bg-background text-sm px-3 pr-9 text-left
            hover:bg-white/70 dark:hover:bg-zinc-800/60
            transition
          "
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options
            className="
              absolute z-50 mt-2 w-full overflow-auto rounded-md border border-[var(--gv-border)]
              bg-white dark:bg-zinc-900 shadow-xl focus:outline-none max-h-72
            "
          >
            <Listbox.Option
              key="__all__"
              value=""
              className={({ active }: { active: boolean }) =>
                cn(
                  "cursor-pointer px-3 py-2 text-sm",
                  active ? "bg-[var(--gv-accent)]/10 text-foreground" : "text-foreground"
                )
              }
            >
              {({ selected }: { selected: boolean }) => (
                <div className="flex items-center gap-2">
                  {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  <span>All</span>
                </div>
              )}
            </Listbox.Option>

            {options.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ active }: { active: boolean }) =>
                  cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    active ? "bg-[var(--gv-accent)]/10 text-foreground" : "text-foreground"
                  )
                }
              >
                {({ selected }: { selected: boolean }) => (
                  <div className="flex items-center gap-2">
                    {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    <span>{opt}</span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default function ExercisesPage() {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

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
          <p className="text-sm text-muted-foreground">Przeglądaj ćwiczenia, filtruj po mięśniach i sprzęcie.</p>
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
            options={ALL_MUSCLES}
            placeholder="Muscle"
          />

          <SimpleSelect
            value={equipment}
            onChange={setEquipment}
            options={ALL_EQUIP}
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
            <Card
              key={ex.id}
              className="overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]"
            >
              <CardContent className="p-0">
                <div className="h-48 w-full overflow-hidden">
                  {ex.imageUrl ? (
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="h-full w-full grid place-items-center text-white font-semibold text-lg"
                      style={{ background: thumbGradient(ex.name) }}
                    >
                      {ex.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold">{ex.name}</h3>
                    {ex.difficulty && (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          ex.difficulty === "Początkujący" && "bg-emerald-500/15 text-emerald-600",
                          ex.difficulty === "Średnio-zaawansowany" && "bg-amber-500/15 text-amber-700",
                          ex.difficulty === "Zaawansowany" && "bg-red-500/15 text-red-600"
                        )}
                      >
                        {ex.difficulty}
                      </span>
                    )}
                  </div>

                  {ex.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ex.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {ex.primaryMuscles.slice(0, 3).map((m) => (
                      <span key={m} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                        {m}
                      </span>
                    ))}
                    {(ex.secondaryMuscles ?? []).slice(0, 2).map((m) => (
                      <span key={m} className="rounded-md border px-2 py-0.5 text-xs">
                        {m}
                      </span>
                    ))}
                    {ex.equipment.slice(0, 2).map((e) => (
                      <span key={e} className="rounded-md border px-2 py-0.5 text-xs">
                        {e}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => alert(`(Mock) Open details for: ${ex.name}`)}
                    >
                      Details
                    </Button>
                    {ex.videoUrl ? (
                      <a
                        href={ex.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[var(--gv-accent)] underline-offset-4 hover:underline"
                      >
                        Watch video
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">No video</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
