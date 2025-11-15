import api from "./client";

export type RoutineCreateDto = {
  name: string;
  description?: string | null;
  days: Array<{
    name: string;
    notes?: string | null;
    exercises: Array<{
      exerciseId: string;
      order: number;
      targetSets?: number | null;
      targetRepsMin?: number | null;
      targetRepsMax?: number | null;
      targetRpe?: number | null;
      restSeconds?: number | null;
      notes?: string | null;
    }>;
  }>;
};

export type RoutineDto = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

// POST /routines
export async function createRoutine(
  payload: RoutineCreateDto,
  signal?: AbortSignal
): Promise<RoutineDto> {
  return api<RoutineDto>("/routines", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
    // headers „Content-Type” + „Authorization” są dodawane w client.ts
  });
}

// GET /routines (lista moich)
export async function listMyRoutines(signal?: AbortSignal): Promise<RoutineDto[]> {
  return api<RoutineDto[]>("/routines", { method: "GET", signal });
}

// (opcjonalnie) GET /routines/:id – przyda się do edytora
export async function getRoutine(id: string, signal?: AbortSignal) {
  return api(`/routines/${id}`, { method: "GET", signal });
}