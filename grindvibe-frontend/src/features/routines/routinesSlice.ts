import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type DraftExercise = {
  id: string;            // local id in UI
  exerciseId: string;    // from ExerciseDto.id
  name: string;
  order: number;
  targetSets?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  targetRpe?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
};

export type DraftDay = {
  id: string;
  name: string;
  notes?: string | null;
  exercises: DraftExercise[];
};

export type RoutineDraftState = {
  name: string;
  description?: string | null;
  days: DraftDay[];
};

const initialState: RoutineDraftState = {
  name: "",
  description: "",
  days: [
    { id: crypto.randomUUID(), name: "Day 1", notes: "", exercises: [] },
  ],
};

const routinesSlice = createSlice({
  name: "routinesDraft",
  initialState,
  reducers: {
    resetDraft: () => initialState,
    setName(state, action: PayloadAction<string>) { state.name = action.payload; },
    setDescription(state, action: PayloadAction<string | null | undefined>) { state.description = action.payload ?? ""; },
    addDay(state, action: PayloadAction<{ name?: string } | undefined>) {
      state.days.push({ id: crypto.randomUUID(), name: action?.payload?.name ?? `Day ${state.days.length+1}`, notes: "", exercises: [] });
    },
    removeDay(state, action: PayloadAction<{ dayId: string }>) {
      state.days = state.days.filter(d => d.id !== action.payload.dayId);
    },
    renameDay(state, action: PayloadAction<{ dayId: string; name: string }>) {
      const d = state.days.find(x => x.id === action.payload.dayId);
      if (d) d.name = action.payload.name;
    },
    addExerciseToDay(state, action: PayloadAction<{ dayId: string; exercise: Omit<DraftExercise,"id"|"order"> }>) {
      const d = state.days.find(x => x.id === action.payload.dayId);
      if (!d) return;
      const order = d.exercises.length + 1;
      d.exercises.push({ id: crypto.randomUUID(), order, ...action.payload.exercise });
    },
    updateExercise(state, action: PayloadAction<{ dayId: string; exId: string; patch: Partial<DraftExercise> }>) {
      const d = state.days.find(x => x.id === action.payload.dayId);
      if (!d) return;
      const ex = d.exercises.find(e => e.id === action.payload.exId);
      if (!ex) return;
      Object.assign(ex, action.payload.patch);
    },
    removeExercise(state, action: PayloadAction<{ dayId: string; exId: string }>) {
      const d = state.days.find(x => x.id === action.payload.dayId);
      if (!d) return;
      d.exercises = d.exercises.filter(e => e.id !== action.payload.exId)
        .map((e, i) => ({ ...e, order: i+1 }));
    },
    reorderExercise(state, action: PayloadAction<{ dayId: string; exId: string; newOrder: number }>) {
      const d = state.days.find(x => x.id === action.payload.dayId);
      if (!d) return;
      const arr = [...d.exercises];
      const idx = arr.findIndex(e => e.id === action.payload.exId);
      if (idx < 0) return;
      const [moved] = arr.splice(idx, 1);
      arr.splice(Math.max(0, Math.min(action.payload.newOrder-1, arr.length)), 0, moved);
      d.exercises = arr.map((e, i) => ({ ...e, order: i+1 }));
    },
  }
});

export const {
  resetDraft, setName, setDescription,
  addDay, removeDay, renameDay,
  addExerciseToDay, updateExercise, removeExercise, reorderExercise
} = routinesSlice.actions;

export default routinesSlice.reducer;