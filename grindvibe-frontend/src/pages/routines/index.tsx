import { useEffect, useState } from "react"; // Dodaj useEffect
import { PlusCircle, Search, Dumbbell, ClipboardList } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// Importuj funkcję z API
import { listMyRoutines, type RoutineDto } from "../../api/routines"; 
import { Notice } from "../../components/ui/Notice"; // Opcjonalnie do błędów

export default function RoutinesPage() {
  // Zmień stan na pustą tablicę na start
  const [routines, setRoutines] = useState<RoutineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // POBIERANIE DANYCH Z BACKENDU
  useEffect(() => {
    let mounted = true;
    
    async function load() {
      try {
        setLoading(true);
        const data = await listMyRoutines(); // To strzela do GET /routines
        if (mounted) setRoutines(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Nie udało się pobrać planów.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, []);

  const actionCards = [
    {
      icon: <PlusCircle className="h-8 w-8 text-[color(display-p3_0.35_0.60_1)] mb-1" />,
      title: "Utwórz nową rutynę",
      desc: "Zbuduj własny plan krok po kroku",
      to: "/routines/new",
    },
    {
      icon: <Search className="h-8 w-8 text-[color(display-p3_0.35_0.60_1)] mb-1" />,
      title: "Wyszukaj rutyny",
      desc: "Przeglądaj gotowe plany i kopiuj je",
      to: "/routines/discover", // utworzymy później
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-[color(display-p3_0.35_0.60_1)] mb-1" />,
      title: "Szybki trening",
      desc: "Zapisz bieżący workout bez rutyny",
      to: "/workout/quick", // utworzymy później
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Routines</h1>
        <p className="text-sm text-muted-foreground">
          Twórz własne plany, przeglądaj gotowe rutyny lub rozpocznij szybki trening.
        </p>
      </div>

      {/* ACTION CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {actionCards.map((a) => (
          <Link key={a.to} to={a.to}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group h-[175px] relative overflow-hidden rounded-3xl border
                         border-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                         bg-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                         hover:bg-[color-mix(in_oklab,var(--gv-bg)_70%,#fff_30%)]
                         shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)]
                         hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)]
                         transition-all duration-300 ease-out cursor-pointer grid place-items-center text-center p-4"
            >
              <div className="flex flex-col items-center justify-center">
                {a.icon}
                <h3 className="text-base font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* USER ROUTINES */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Twoje rutyny</h2>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Ładowanie planów...</div>}
      {error && <Notice kind="error">{error}</Notice>}

      {!loading && !error && routines.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnych rutyn.<br />
          <span className="text-[color(display-p3_0.35_0.60_1)]">Utwórz pierwszą powyżej!</span>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routines.map((r) => (
            <motion.div
              key={r.id} // r.id = int fromd DTO
              initial={{ opacity: 0.95, y: 0 }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 24, mass: 0.6 }}
            >
              <Link to={`/routines/${r.id}`} className="block">
                <Card
                  className="relative overflow-hidden rounded-3xl border
                             border-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                             bg-[color-mix(in_oklab,var(--gv-bg)_90%,#fff_10%)]
                             shadow-[0_4px_18px_-6px_rgba(0,0,0,0.35)]
                             hover:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.45)]
                             transition-all duration-200 ease-out h-[175px] flex flex-col"
                >
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-semibold line-clamp-1">{r.name}</h3>
                      <Dumbbell className="h-4 w-4 text-muted-foreground/70" />
                    </div>

                    {r.description && (
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground/90 flex-1">
                        {r.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground/70">
                      <span>Plan treningowy</span> 
                      <span className="text-[color(display-p3_0.35_0.60_1)] font-medium">Zobacz</span>
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
