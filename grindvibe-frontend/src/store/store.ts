import { configureStore } from "@reduxjs/toolkit";
import exercisesFiltersReducer from "../features/exercises/exercisesFiltersSlice";
import { listsReducer } from "../features/lists/listsSlice";
import { authReducer } from "../features/auth/authSlice";
import routinesDraft from "../features/routines/routinesSlice";
import workoutReducer from "../features/workout/workoutSlice";

export const store = configureStore({
    reducer: {
        lists: listsReducer,
        exercisesFilters: exercisesFiltersReducer,
        auth: authReducer,
        routines: routinesDraft,
        workout: workoutReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;