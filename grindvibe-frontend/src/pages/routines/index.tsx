import { useEffect, useState } from "react";
import { PlusCircle, Search, Dumbbell, ClipboardList, Trash2, X, Settings2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { listMyRoutines, deleteRoutine, type RoutineDto } from "../../api/routines";
import { Notice } from "../../components/ui/Notice";
import { useAuth } from "../../auth/useAuth";

export default function RoutinesPage() {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<RoutineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<RoutineDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token) return; 

    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await listMyRoutines();
        
        console.log("Routines loaded from API:", data);

        if (mounted) setRoutines(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Nie udało się pobrać listy rutyn.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [token]);

  const handleDeleteConfirm = async () => {
    if (!routineToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRoutine(routineToDelete.id);
      setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete.id));
      setRoutineToDelete(null);
      if (routines.length <= 1) setIsDeleteMode(false);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Wystąpił błąd podczas usuwania rutyny.");
    } finally {
      setIsDeleting(false);
    }
  };

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
      to: "/routines/discover",
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-[color(display-p3_0.35_0.60_1)] mb-1" />,
      title: "Szybki trening",
      desc: "Zapisz bieżący workout bez rutyny",
      to: "/workout/quick",
    },
  ];

  const shakeVariants = {
    idle: { rotate: 0 },
    shaking: {
      rotate: [0, -0.5, 0.5, -0.5, 0], 
      transition: {
        duration: 0.4, 
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const, 
      },
    },
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Twoje plany</h1>
        <p className="text-sm text-muted-foreground">
          Zarządzaj swoimi rutynami treningowymi.
        </p>
      </div>

      {/* KARTY AKCJI (Wygaszamy je w trybie usuwania, żeby nie rozpraszały) */}
      <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10 transition-opacity duration-300 ${isDeleteMode ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
        {actionCards.map((a) => (
          <Link key={a.to} to={a.to}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group h-[175px] relative overflow-hidden rounded-3xl border
                         border-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                         bg-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                         hover:bg-[color-mix(in_oklab,var(--gv-bg)_70%,#fff_30%)]
                         shadow-sm hover:shadow-md
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

      {/* NAGŁÓWEK LISTY + PRZYCISK ZARZĄDZANIA */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Twoje rutyny</h2>
        
        {routines.length > 0 && (
          <Button
            variant={isDeleteMode ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className="gap-2 transition-all rounded-full cursor-pointer"
          >
            {isDeleteMode ? (
              <>
                <X className="h-4 w-4" /> Gotowe
              </>
            ) : (
              <>
                <Settings2 className="h-4 w-4" /> Zarządzaj
              </>
            )}
          </Button>
        )}
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
          {routines.map((r, idx) => (
            <motion.div
              key={r.id}
              variants={shakeVariants}
              animate={isDeleteMode ? "shaking" : "idle"}
              style={{ transformOrigin: "center center" }}
              custom={idx} 
            >
              {isDeleteMode ? (
                <div 
                  onClick={() => setRoutineToDelete(r)}
                  className="cursor-pointer relative block h-full"
                >
                  {/* Ikonka minusa/kosza w rogu */}
                  <div className="absolute -top-2 -left-2 z-20 bg-red-500 text-white rounded-full p-1.5 shadow-md animate-in fade-in zoom-in duration-200">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  
                  <RoutineCardContent r={r} isDeleteMode={true} />
                </div>
              ) : (
                // Use slug if available, otherwise fallback to ID
                <Link to={`/routines/${r.slug || r.id}`} className="block h-full">
                  <RoutineCardContent r={r} isDeleteMode={false} />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {routineToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRoutineToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-[var(--gv-bg)] border border-border shadow-2xl"
            >
              <div className="p-6">
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Usunąć rutynę?</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Czy na pewno chcesz usunąć <strong>"{routineToDelete.name}"</strong>? 
                      <br/>Tej operacji nie można cofnąć.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setRoutineToDelete(null)}
                    disabled={isDeleting}
                    className="rounded-xl"
                  >
                    Anuluj
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="gap-2 rounded-xl border border-red-600/40 shadow-sm cursor-pointer"
                  >
                    {isDeleting ? "Usuwanie..." : "Usuń"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

// helper component for routine card content
function RoutineCardContent({ r, isDeleteMode }: { r: RoutineDto, isDeleteMode: boolean }) {
  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border cursor-pointer
                 border-[color-mix(in_oklab,var(--gv-bg)_80%,#fff_20%)]
                 bg-[color-mix(in_oklab,var(--gv-bg)_90%,#fff_10%)]
                 shadow-sm
                 transition-all duration-200 ease-out h-[175px] flex flex-col
                 ${isDeleteMode ? "ring-2 ring-red-500/50 bg-red-500/5 opacity-90" : "hover:shadow-md hover:scale-[1.02]"}
                 `}
    >
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold line-clamp-1">{r.name}</h3>
          <Dumbbell className="h-5 w-5 text-muted-foreground/50" />
        </div>

        {r.description ? (
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground/80 flex-1">
            {r.description}
          </p>
        ) : (
          <p className="mb-2 text-sm text-muted-foreground/40 italic flex-1">
            Brak opisu
          </p>
        )}

        <div className="mt-auto flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">Plan treningowy</span>
          {isDeleteMode ? (
            <span className="text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-md">
              <Trash2 className="h-3 w-3" /> Usuń
            </span>
          ) : (
            <span className="text-[color(display-p3_0.35_0.60_1)] bg-primary/5 px-2 py-1 rounded-md">
              Otwórz
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
