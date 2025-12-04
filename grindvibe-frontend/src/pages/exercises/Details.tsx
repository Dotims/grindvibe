import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExerciseById, type ExerciseDto } from "../../api/exercises";
import { startWorkout, type ActiveExercise } from "../../features/workout/workoutSlice";
import { useAppDispatch } from "../../store/hooks";

export default function ExerciseDetail() {
    const { id } = useParams<{ id: string }>();

    const [ data, setData ] = useState<ExerciseDto | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const dispatch = useAppDispatch(); // Ensure dispatch is available

    useEffect(() => {
        if (!id) return;
        let alive = true;

        (async () => {
            try {
                const res = await getExerciseById(id);
                if (!alive) return;
                setData(res);
            } catch {
                if(alive) setError("Nie udało się załadować ćwiczenia");
            } finally {
                if (!alive) setLoading(false);
                setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [id]);

    const handleStartWorkout = () => {
        if (!data) return;

        // 1. Map routine structure to Active Workout structure
        const activeExercises: ActiveExercise[] = [];
        
        data.days.forEach(day => {
            day.exercises.forEach(ex => {
                const meta = parseMeta(ex.notes);
                
                activeExercises.push({
                    id: crypto.randomUUID(),
                    exerciseId: ex.exerciseId,
                    name: ex.name,
                    sets: meta.sets.map((s, idx) => ({
                        id: crypto.randomUUID(),
                        setNumber: idx + 1,
                        targetWeight: s.weight,
                        targetRepsMin: s.repsMin,
                        targetRepsMax: s.repsMax,
                        targetRpe: s.rpe,
                        restSeconds: s.restSeconds, // Pass rest time
                        actualWeight: s.weight ? String(s.weight) : "", // Pre-fill weight if available
                        actualReps: "",
                        actualRpe: "",
                        completed: false
                    }))
                });
            });
        });

        // 2. Dispatch to Redux
        dispatch(startWorkout({
            routineId: data.id,
            routineName: data.name,
            exercises: activeExercises
        }));

        // 3. Navigate
        navigate('/workout/active');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!data) return <div>Nie znaleziono ćwiczenia</div>;

     return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{data.name}</h1>

      {data.imageUrl && (
        <img src={data.imageUrl} alt={data.name} className="rounded-xl shadow" />
      )}

      <section>
        <h2 className="font-semibold">Mięśnie główne</h2>
        <p className="text-sm opacity-80">{data.primaryMuscles.join(", ") || "—"}</p>
      </section>

      <section>
        <h2 className="font-semibold">Mięśnie pomocnicze</h2>
        <p className="text-sm opacity-80">{data.secondaryMuscles.join(", ") || "—"}</p>
      </section>

      <section>
        <h2 className="font-semibold">Sprzęt</h2>
        <p className="text-sm opacity-80">{data.equipment.join(", ") || "—"}</p>
      </section>

      {data.description && (
        <section>
          <h2 className="font-semibold">Opis</h2>
          <p className="text-sm leading-6">{data.description}</p>
        </section>
      )}

      <div className="mt-6">
        <Button 
          size="lg"
          className="rounded-full gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer" 
          style={{ backgroundColor: ACCENT }}
          onClick={handleStartWorkout}
        >
          <Play className="h-4 w-4 fill-current" />
          Rozpocznij trening
        </Button>
      </div>
    </div>
  );
}