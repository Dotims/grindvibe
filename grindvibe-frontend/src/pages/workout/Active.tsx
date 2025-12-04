import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { cancelWorkout, updateSet, toggleSetComplete, skipRest, addRestTime } from "../../features/workout/workoutSlice";
import { finishWorkout } from "../../api/routines";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Check, Clock, X, Plus, Minus, SkipForward } from "lucide-react";
import { ACCENT } from "../../lib/routinesMeta";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper: Global Workout Timer ---
function useWorkoutTimer(startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(i);
  }, [startTime]);
  
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- Helper: Rest Timer Logic ---
function useRestTimer(endTime: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!endTime) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.ceil((endTime - Date.now()) / 1000);
      setRemaining(left > 0 ? left : 0);
    };
    tick(); // immediate
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endTime]);
  return remaining;
}

export default function ActiveWorkoutPage() {
  const workout = useAppSelector(s => s.workout);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const timerString = useWorkoutTimer(workout.startTime);
  const restRemaining = useRestTimer(workout.restEndTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no active workout
  useEffect(() => {
    if (!workout.isActive) navigate('/routines');
  }, [workout.isActive, navigate]);

  if (!workout.isActive) return null;

  const handleFinish = async () => {
    if (!confirm("Zakończyć trening i zapisać?")) return;
    setIsSubmitting(true);
    try {
      const setsPayload = workout.exercises.flatMap(ex => 
        ex.sets
          .filter(s => s.completed)
          .map(s => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            setNumber: s.setNumber,
            weight: s.actualWeight ? parseFloat(s.actualWeight) : null,
            reps: s.actualReps ? parseInt(s.actualReps) : null,
            rpe: s.actualRpe ? parseFloat(s.actualRpe) : null
          }))
      );

      await finishWorkout({
        routineId: workout.routineId,
        name: workout.routineName,
        startedAt: new Date(workout.startTime!).toISOString(),
        endedAt: new Date().toISOString(),
        sets: setsPayload
      });

      dispatch(cancelWorkout());
      navigate('/routines');
    } catch (err) {
      console.error(err);
      alert("Błąd zapisu treningu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format rest time MM:SS
  const formatRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-32 bg-[var(--gv-bg)] text-[var(--gv-text)] relative min-h-screen">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[var(--gv-bg)]/95 backdrop-blur py-4 border-b border-border/50 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold leading-tight line-clamp-1">{workout.routineName}</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--gv-accent)] font-mono mt-1">
            <Clock className="h-3 w-3" /> {timerString}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { if(confirm("Anulować trening?")) { dispatch(cancelWorkout()); navigate('/routines'); } }}>
            <X className="h-5 w-5" />
          </Button>
          <Button size="sm" onClick={handleFinish} disabled={isSubmitting} style={{ backgroundColor: ACCENT }}>
            {isSubmitting ? "Zapisywanie..." : "Zakończ"}
          </Button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-6">
        {workout.exercises.map((ex, exIdx) => (
          <Card key={ex.id} className="overflow-hidden border border-border/50 shadow-sm">
            <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex justify-between items-center">
              <h3 className="font-semibold text-base">{ex.name}</h3>
            </div>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center bg-muted/10">
                <span>Set</span>
                <span>Kg</span>
                <span>Reps</span>
                <span>RPE</span>
                <span>✓</span>
              </div>
              
              {/* Sets Rows */}
              {ex.sets.map((set, sIdx) => {
                const isDone = set.completed;
                return (
                  <div 
                    key={set.id} 
                    className={`grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 px-4 py-2 items-center border-t border-border/30 transition-colors ${isDone ? "bg-green-500/10" : ""}`}
                  >
                    {/* Set Number */}
                    <div className="text-center text-sm font-mono text-muted-foreground">
                      {set.setNumber}
                    </div>
                    
                    {/* Weight Input */}
                    <Input 
                      type="number" 
                      placeholder={set.targetWeight ? `${set.targetWeight}` : "-"}
                      className={`h-9 text-center text-sm font-medium ${isDone ? "border-green-500/30 text-green-600 bg-green-500/5" : ""}`}
                      value={set.actualWeight}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualWeight', value: e.target.value }))}
                      inputMode="decimal"
                    />
                    
                    {/* Reps Input */}
                    <Input 
                      type="number" 
                      placeholder={set.targetRepsMin ? `${set.targetRepsMin}` : "-"}
                      className={`h-9 text-center text-sm font-medium ${isDone ? "border-green-500/30 text-green-600 bg-green-500/5" : ""}`}
                      value={set.actualReps}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualReps', value: e.target.value }))}
                      inputMode="numeric"
                    />

                    {/* RPE Input */}
                    <Input 
                      type="number" 
                      placeholder="-"
                      className={`h-9 text-center text-sm font-medium ${isDone ? "border-green-500/30 text-green-600 bg-green-500/5" : ""}`}
                      value={set.actualRpe}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualRpe', value: e.target.value }))}
                      inputMode="decimal"
                    />

                    {/* Check Button */}
                    <button
                      onClick={() => dispatch(toggleSetComplete({ exerciseIndex: exIdx, setIndex: sIdx }))}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isDone ? "bg-green-500 text-white shadow-md scale-105" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* REST TIMER OVERLAY */}
      <AnimatePresence>
        {restRemaining > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="mx-auto max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="relative grid place-items-center h-12 w-12">
                   <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                     <path className="text-zinc-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                     <path className="text-[var(--gv-accent)] transition-all duration-1000 ease-linear" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                   </svg>
                   <span className="text-xs font-bold">{formatRest(restRemaining)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-300">Przerwa</p>
                  <p className="text-xs text-zinc-500">Odpocznij chwilę...</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/10 text-white" onClick={() => dispatch(addRestTime(-10))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/10 text-white" onClick={() => dispatch(addRestTime(10))}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 ml-2" onClick={() => dispatch(skipRest())}>
                  <SkipForward className="h-4 w-4 mr-1" /> Pomiń
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}