import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ActiveSet = {
  id: string;
  setNumber: number;
  targetWeight?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  targetRpe?: number | null;
  restSeconds?: number | null;
  
  actualWeight: string;
  actualReps: string;
  actualRpe: string;
  completed: boolean;
};

export type ActiveExercise = {
  id: string;
  exerciseId: string;
  name: string;
  imageUrl?: string | null; // <--- DODANO: Pole na obrazek
  sets: ActiveSet[];
};

export type WorkoutState = {
  isActive: boolean;
  routineId: number | null;
  routineName: string;
  startTime: number | null;
  exercises: ActiveExercise[];
  restEndTime: number | null;
};

const initialState: WorkoutState = {
  isActive: false,
  routineId: null,
  routineName: "",
  startTime: null,
  exercises: [],
  restEndTime: null,
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
      state.restEndTime = null;
    },
    cancelWorkout() {
      return initialState;
    },
    updateSet(state, action: PayloadAction<{ exerciseIndex: number; setIndex: number; field: 'actualWeight' | 'actualReps' | 'actualRpe'; value: string }>) {
      const { exerciseIndex, setIndex, field, value } = action.payload;
      const ex = state.exercises[exerciseIndex];
      if (ex && ex.sets[setIndex]) {
        if (parseFloat(value) < 0) return; 
        ex.sets[setIndex][field] = value;
      }
    },
    toggleSetComplete(state, action: PayloadAction<{ exerciseIndex: number; setIndex: number }>) {
      const { exerciseIndex, setIndex } = action.payload;
      const ex = state.exercises[exerciseIndex];
      if (!ex || !ex.sets[setIndex]) return;

      const set = ex.sets[setIndex];
      set.completed = !set.completed;

      if (set.completed) {
        const restDuration = set.restSeconds || 180;
        state.restEndTime = Date.now() + (restDuration * 1000);
      }
    },
    skipRest(state) {
      state.restEndTime = null;
    },
    addRestTime(state, action: PayloadAction<number>) {
      if (state.restEndTime) {
        state.restEndTime += (action.payload * 1000);
      }
    }
  }
});

export const { startWorkout, cancelWorkout, updateSet, toggleSetComplete, skipRest, addRestTime } = workoutSlice.actions;
export default workoutSlice.reducer;