import api from "./client";

export type RoutineCreateDto = {
  name: string;
  description?: string | null;
  days: Array<{
    name: string;
    notes?: string | null;
    exercises: Array<{
      exerciseId: string;
      name?: string;
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
  slug?: string; // Optional for backward compatibility
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

// /routines/:id
export async function updateRoutine(
  id: string | number,
  payload: RoutineCreateDto,
  signal?: AbortSignal
): Promise<void> {
  return api<void>(`/routines/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    signal,
  });
}

// POST /routines
export async function createRoutine(
  payload: RoutineCreateDto,
  signal?: AbortSignal
): Promise<RoutineDto> {
  return api<RoutineDto>("/routines", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
    // Headers 'Content-Type' + 'Authorization' are added in client.ts
  });
}

// GET /routines (list mine)
export async function listMyRoutines(signal?: AbortSignal): Promise<RoutineDto[]> {
  return api<RoutineDto[]>("/routines", { method: "GET", signal });
}

// (Optional) GET /routines/:id - useful for editor
export async function getRoutine(id: string, signal?: AbortSignal) {
  return api(`/routines/${id}`, { method: "GET", signal });
}

// GET /routines/by-slug/:slug
export async function getRoutineBySlug(slug: string, signal?: AbortSignal) {
  return api(`/routines/by-slug/${slug}`, { method: "GET", signal });
}

// DELETE /routines/:id
export async function deleteRoutine(id: string): Promise<void> {
  return api<void>(`/routines/${id}`, {
    method: "DELETE",
  });
}

// POST /workouts
export async function finishWorkout(payload: any) {
  return api("/workouts", { method: "POST", body: JSON.stringify(payload) });
}