import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit";

export type ExercisesFiltersState = {
    q: string;
    muscle: string;
    equipment: string;
    page: number;
    pageSize: number;
}

const initialState: ExercisesFiltersState = {
    q: "",
    muscle: "",
    equipment: "",
    page: 1,
    pageSize: 12,
};

const exercisesFiltersSlice = createSlice({
    name: "exercises/filters",
    initialState,
    reducers: {
        setQ(state, action: PayloadAction<string>) {
            state.q = action.payload.trim()
            state.page = 1;
        },
        setMuscle(state, action: PayloadAction<string>) {
            state.muscle = action.payload;
            state.page = 1
        },
        setEquipment(state, action: PayloadAction<string>) {
            state.equipment = action.payload;
            state.page = 1
        },
        setPage(state, action: PayloadAction<number>) {
            state.page = Math.max(1, Math.trunc(action.payload) || 1)
        },
        setPageSize(state, action: PayloadAction<number>) {
            const size = Math.max(1, Math.trunc(action.payload) || state.pageSize);
            state.pageSize = size;
            state.page = 1;
        },
        resetFilters() {
            return initialState;
        },
        
        setAll(state, action: PayloadAction<Partial<ExercisesFiltersState>>) {
            const next = action.payload;
            if (next.q !== undefined) state.q = next.q.trim();
            if (next.muscle !== undefined) state.muscle = next.muscle;
            if (next.equipment !== undefined) state.equipment = next.equipment;
            if (next.pageSize !== undefined) state.pageSize = Math.max(1, Math.trunc(next.pageSize));
            if (next.page !== undefined) state.page = Math.max(1, Math.trunc(next.page))
        },
    },
});

export const {
    setQ,
    setMuscle,
    setEquipment,
    setPage,
    setPageSize,
    resetFilters,
    setAll,
} = exercisesFiltersSlice.actions;

export default exercisesFiltersSlice.reducer;