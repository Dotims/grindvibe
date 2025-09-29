import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store"

export const selectExercisesFilters = (s: RootState) => s.exercisesFilters;

export const selectQueryParams = createSelector(
    [selectExercisesFilters],
    (f) => ({
        q: f.q,
        page: f.page,
        pageSize: f.pageSize,
        muscle: f.muscle ? [f.muscle] : [],
        quipment: f.equipment ? [f.equipment] : [],
    })
);

export const selectAreFiltersDirty = createSelector(
    [selectExercisesFilters],
    (f) => !!(f.q || f.muscle || f.equipment)
)