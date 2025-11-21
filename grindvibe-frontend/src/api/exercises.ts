import api from "./client";

export type ExerciseLists = { muscles: string[]; equipments: string[] };

let listsCache: { data: ExerciseLists; ts: number } | null = null;
let inFlightLists: Promise<ExerciseLists> | null = null;
const LISTS_TTL_MS = 10 * 60 * 1000;

type RawListsResponse = {
  bodyParts?: string[];
  muscles?: string[];
  equipments?: string[];
}

export async function getExerciseLists(opts?: { force?: boolean }): Promise<ExerciseLists> {
  const isFresh = listsCache && Date.now() - listsCache.ts < LISTS_TTL_MS;
  if (!opts?.force && isFresh) {
    return listsCache!.data;
  }

  if (inFlightLists) {
    return inFlightLists;
  }

  inFlightLists = (async () => {
    try {
      const raw = await api<RawListsResponse>("/exercises/lists");

      const muscles: string[] = Array.isArray(raw?.muscles)
        ? raw.muscles
        : Array.isArray(raw?.bodyParts)
          ? raw.bodyParts
          : [];

      const equipments: string[] = Array.isArray(raw?.equipments) ? raw.equipments : [];

      const data: ExerciseLists = { muscles, equipments };

      listsCache = { data, ts: Date.now() };

      return data;
    } finally {
      inFlightLists = null; 
    }
  })();

  return inFlightLists;
}

export function invalidateExerciseListsCache() {
  listsCache = null;
  inFlightLists = null;
}

export interface ExerciseDto {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty?: string | null;
  imageUrl?: string;
  videoUrl?: string | null;
  description?: string | null;
  bodyPart?: string | null;
  instructions?: string[] | null;
}

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export type SearchExercisesParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  muscle?: string[];
  equipment?: string[];
};

export function searchExercises(
  params?: SearchExercisesParams,
  signal?: AbortSignal
): Promise<PagedResult<ExerciseDto>> {
  const q = (params?.q ?? "").trim();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 12;

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (q) qs.set("q", q);
  for (const m of params?.muscle ?? []) if (m && m.trim()) qs.append("muscles", m.trim());
  for (const e of params?.equipment ?? []) if (e && e.trim()) qs.append("equipment", e.trim());

  // console.log("[API CALL] /exercises ->", qs.toString()); 
  return api<PagedResult<ExerciseDto>>(`/exercises?${qs.toString()}`, { signal });
}

export function getExerciseById(id: string): Promise<ExerciseDto> {
  return api<ExerciseDto>(`/exercises/${id}`);
}

type SearchKey = string;
type searchCacheEntry = { data: PagedResult<ExerciseDto>; ts: number };
const searchCache = new Map<SearchKey, searchCacheEntry>();
const SEARCH_TTL_MS = 2 * 60 * 1000;

export function makeSearchKey(params?: SearchExercisesParams): SearchKey {
  const q = (params?.q ?? "").trim();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 12;

  const muscles = [...(params?.muscle ?? [])].map(s => s.trim()).filter(Boolean).sort();
  const equipment = [...(params?.equipment ?? [])].map(s => s.trim()).filter(Boolean).sort();

  return JSON.stringify({ q, page, pageSize, muscles, equipment });
}

// returned data from Cache, else undefined
export function getCachedSearch(params?: SearchExercisesParams): PagedResult<ExerciseDto> | undefined {
  const key = makeSearchKey(params);
  const hit = searchCache.get(key)
  if (hit && Date.now() - hit.ts < SEARCH_TTL_MS) {
    // console.log("[CACHE HIT]", key); 
    return hit.data;
  }
  // console.log("[CACHE MISS]", key);   
  return undefined;
}

export async function fetchAndCacheSearch(
  params: SearchExercisesParams | undefined,
  signal?: AbortSignal
): Promise<PagedResult<ExerciseDto>> {
  const data = await searchExercises(params, signal);
  const key = makeSearchKey(params)
  searchCache.set(key, { data, ts: Date.now() })
  return data;
}