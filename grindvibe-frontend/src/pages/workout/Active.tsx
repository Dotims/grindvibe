import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { cancelWorkout, updateSet, toggleSetComplete } from "../../features/workout/workoutSlice";
import { finishWorkout } from "../../api/routines";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Check, Clock, X } from "lucide-react";
import { ACCENT } from "../../lib/routinesMeta";

// Helper hook for timer
function useTimer(startTime: number | null) {
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

export default function ActiveWorkoutPage() {
  const workout = useAppSelector(s => s.workout);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const timerString = useTimer(workout.startTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no active workout
  useEffect(() => {
    if (!workout.isActive) navigate('/routines');
  }, [workout.isActive, navigate]);

  if (!workout.isActive) return null;

  const handleFinish = async () => {
    if (!confirm("Finish workout and save?")) return;
    setIsSubmitting(true);
    try {
      // Flatten sets for API
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
      alert("Failed to save workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24 bg-[var(--gv-bg)] text-[var(--gv-text)]">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[var(--gv-bg)]/95 backdrop-blur py-4 border-b border-border/50 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold leading-tight">{workout.routineName}</h1>
          <div className="flex items-center gap-1 text-sm text-[var(--gv-accent)] font-mono">
            <Clock className="h-3 w-3" /> {timerString}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { if(confirm("Cancel workout?")) { dispatch(cancelWorkout()); navigate('/routines'); } }}>
            <X className="h-5 w-5" />
          </Button>
          <Button size="sm" onClick={handleFinish} disabled={isSubmitting} style={{ backgroundColor: ACCENT }}>
            {isSubmitting ? "Saving..." : "Finish"}
          </Button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-6">
        {workout.exercises.map((ex, exIdx) => (
          <Card key={ex.id} className="overflow-hidden border border-border/50">
            <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
              <h3 className="font-semibold text-base">{ex.name}</h3>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 px-4 py-2 text-xs text-muted-foreground font-medium text-center">
                <span>Set</span>
                <span>kg</span>
                <span>Reps</span>
                <span>RPE</span>
                <span>✓</span>
              </div>
              
              {ex.sets.map((set, sIdx) => {
                const isDone = set.completed;
                return (
                  <div 
                    key={set.id} 
                    className={`grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 px-4 py-2 items-center border-t border-border/30 transition-colors ${isDone ? "bg-green-500/10" : ""}`}
                  >
                    <div className="text-center text-sm font-mono text-muted-foreground">
                      {set.setNumber}
                    </div>
                    
                    <Input 
                      type="number" 
                      placeholder={set.targetWeight ? `${set.targetWeight}` : "-"}
                      className={`h-8 text-center text-sm ${isDone ? "border-green-500/30 text-green-600" : ""}`}
                      value={set.actualWeight}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualWeight', value: e.target.value }))}
                    />
                    
                    <Input 
                      type="number" 
                      placeholder={set.targetRepsMin ? `${set.targetRepsMin}` : "-"}
                      className={`h-8 text-center text-sm ${isDone ? "border-green-500/30 text-green-600" : ""}`}
                      value={set.actualReps}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualReps', value: e.target.value }))}
                    />

                    <Input 
                      type="number" 
                      placeholder="-"
                      className={`h-8 text-center text-sm ${isDone ? "border-green-500/30 text-green-600" : ""}`}
                      value={set.actualRpe}
                      onChange={(e) => dispatch(updateSet({ exerciseIndex: exIdx, setIndex: sIdx, field: 'actualRpe', value: e.target.value }))}
                    />

                    <button
                      onClick={() => dispatch(toggleSetComplete({ exerciseIndex: exIdx, setIndex: sIdx }))}
                      className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${isDone ? "bg-green-500 text-white shadow-sm" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}