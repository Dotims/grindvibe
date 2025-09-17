import api from "./client";

export type ExerciseLists = { muscles: string[]; equipments: string[] };

export function getExerciseLists(): Promise<ExerciseLists> {
    return api<ExerciseLists>("/exercises/lists");
}

export type ExerciseDto = {
    id: string;
    name: string;
    imageUrl?: string;
    primaryMuscle: string[];
    secondaryMuscle: string[];
    equipment: string[];
    description?: string | null;
    videoUrl?: string | null; 
}

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
}

export function searchExercises(
    params?: { q?: string; page?: number; pageSize?: number; }
): Promise<PagedResult<ExerciseDto>> {
    const q = params?.q ?? "";
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const qs = new URLSearchParams({ q, page: page.toString(), pageSize: pageSize.toString() });
    return api<PagedResult<ExerciseDto>>(`/exercises?${qs.toString()}`);
}

export function getExerciseById(id: string): Promise<ExerciseDto> {
    return api<ExerciseDto>(`/exercises/${id}`);
}