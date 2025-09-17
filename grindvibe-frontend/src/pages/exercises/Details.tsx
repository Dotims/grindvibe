import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExerciseById, type ExerciseDto } from "../../api/exercises";

export default function ExerciseDetail() {
    const { id } = useParams<{ id: string }>();

    const [ data, setData ] = useState<ExerciseDto | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

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
        <p className="text-sm opacity-80">{data.primaryMuscle.join(", ") || "—"}</p>
      </section>

      <section>
        <h2 className="font-semibold">Mięśnie pomocnicze</h2>
        <p className="text-sm opacity-80">{data.secondaryMuscle.join(", ") || "—"}</p>
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
    </div>
  );
}