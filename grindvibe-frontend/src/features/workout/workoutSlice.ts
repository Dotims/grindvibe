import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Represents a single set row in the active workout UI
export type ActiveSet = {
  id: string; // unique ID for UI
  setNumber: number;
  // Target values (from routine) - for reference
  targetWeight?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  
  // Actual values (user input)
  actualWeight: string; // string to handle empty inputs easily
  actualReps: string;
  actualRpe: string;
  completed: boolean;
};

export type ActiveExercise = {
  id: string; // unique ID
  exerciseId: string;
  name: string;
  sets: ActiveSet[];
};

export type WorkoutState = {
  isActive: boolean;
  routineId: number | null;
  routineName: string;
  startTime: number | null; // Timestamp
  exercises: ActiveExercise[];
};

const initialState: WorkoutState = {
  isActive: false,
  routineId: null,
  routineName: "",
  startTime: null,
  exercises: [],
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkout(state, action: PayloadAction<{ routineId: number; routineName: string; exercises: ActiveExercise[] }>) {
      state.isActive = true;
      state.routineId = action.payload.routineId;
      state.routineName = action.payload.routineName;
      state.exercises = action.payload.exercises;
      state.startTime = Date.now();
    },
    cancelWorkout() {
      return initialState;
    },
    updateSet(state, action: PayloadAction<{ exerciseIndex: number; setIndex: number; field: 'actualWeight' | 'actualReps' | 'actualRpe'; value: string }>) {
      const { exerciseIndex, setIndex, field, value } = action.payload;
      const ex = state.exercises[exerciseIndex];
      if (ex && ex.sets[setIndex]) {
        ex.sets[setIndex][field] = value;
      }
    },
    toggleSetComplete(state, action: PayloadAction<{ exerciseIndex: number; setIndex: number }>) {
      const { exerciseIndex, setIndex } = action.payload;
      const ex = state.exercises[exerciseIndex];
      if (ex && ex.sets[setIndex]) {
        ex.sets[setIndex].completed = !ex.sets[setIndex].completed;
      }
    }
  }
});

export const { startWorkout, cancelWorkout, updateSet, toggleSetComplete } = workoutSlice.actions;
export default workoutSlice.reducer;