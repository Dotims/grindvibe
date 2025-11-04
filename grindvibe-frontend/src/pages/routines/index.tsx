import { useState } from "react";
import { PlusCircle, Dumbbell } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type Routine = {
  id: number;
  name: string;
  description?: string;
  totalExercises: number;
  createdAt: string;
};

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: 1,
      name: "Push–Pull–Legs",
      description: "Klasyczny podział na partie mięśniowe, idealny do budowania siły.",
      totalExercises: 15,
      createdAt: "2025-10-21",
    },
    {
      id: 2,
      name: "Full Body 3x w tygodniu",
      description: "Trening całego ciała dla początkujących.",
      totalExercises: 9,
      createdAt: "2025-11-02",
    },
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routines</h1>
          <p className="text-sm text-muted-foreground">
            Twórz i zarządzaj swoimi planami treningowymi. Monitoruj progres i buduj konsekwencję.
          </p>
        </div>

        <Link to="/routines/new">
          <Button
            variant="default"
            size="sm"
            className="gap-2 rounded-full px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
          >
            <PlusCircle className="h-4 w-4" />
            Nowa rutyna
          </Button>
        </Link>
      </div>

      {/* ROUTINES LIST */}
      {routines.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnych rutyn.<br />
          <span className="text-[var(--gv-accent)]">Kliknij „Nowa rutyna”</span>, aby zacząć.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0.95, y: 0 }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 24, mass: 0.6 }}
            >
              <Link to={`/routines/${r.id}`} className="block">
                <Card
                    className="relative overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--gv-bg)_85%,#fff_15%)]
                                bg-[color-mix(in_oklab,var(--gv-bg)_92%,#fff_8%)]
                                shadow-[0_4px_18px_-6px_rgba(0,0,0,0.35)]
                                hover:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.45)]
                                transition-all duration-200 ease-out"
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{r.name}</h3>
                      <Dumbbell className="h-5 w-5 text-muted-foreground/70" />
                    </div>
                    {r.description && (
                      <p className="mb-3 line-clamp-3 text-sm text-muted-foreground/90">
                        {r.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                      <span>{r.totalExercises} ćwiczeń</span>
                      <span>{new Date(r.createdAt).toLocaleDateString("pl-PL")}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
