import api from "./client";

export type ExerciseLists = { muscles: string[]; equipments: string[] };

export function getExerciseLists(): Promise<ExerciseLists> {
    return api<ExerciseLists>("/exercises/lists");
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
}

export type SearchExercisesParams = {
    q?: string;
    page?: number;
    pageSize?: number;
    muscle?: string[];
    equipment?: string[];
}

export function searchExercises(
    params?: SearchExercisesParams
): Promise<PagedResult<ExerciseDto>> {
    const q = (params?.q ?? "").trim();
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 12;

    const qs = new URLSearchParams({ 
        page: String(page),
        pageSize: String(pageSize)
    });


    if (q) qs.set("q", q);

    for (const m of params?.muscle ?? []) {
        if (m && m.trim()) qs.append("muscles", m.trim());
    }

    for (const e of params?.equipment ?? []) {
        if (e && e.trim()) qs.append("equipment", e.trim());
    }

    console.log("[/exercises] URL ->", `/exercises?${qs.toString()}`);

    return api<PagedResult<ExerciseDto>>(`/exercises?${qs.toString()}`);
}

export function getExerciseById(id: string): Promise<ExerciseDto> {
    return api<ExerciseDto>(`/exercises/${id}`);
}