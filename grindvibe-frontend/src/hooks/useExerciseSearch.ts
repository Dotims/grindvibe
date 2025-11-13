import { useEffect, useState } from "react";
import type { ExerciseDto, PagedResult, SearchExercisesParams } from "../api/exercises";
import { fetchAndCacheSearch, getCachedSearch } from "../api/exercises";

export function useExerciseSearch(q: string, page: number, pageSize: number) {
  const [result, setResult] = useState<PagedResult<ExerciseDto> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const params: SearchExercisesParams = { q, page, pageSize, muscle: [], equipment: [] };
    const cached = getCachedSearch(params);
    if (cached) {
      setResult(cached);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const res = await fetchAndCacheSearch(params, ctl.signal);
        setResult(res);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [q, page, pageSize]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return { result, loading, totalPages, setResult };
}
