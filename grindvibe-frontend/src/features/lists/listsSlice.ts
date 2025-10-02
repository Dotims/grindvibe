import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getExerciseLists, type ExerciseLists } from "../../api/exercises";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ListsState extends ExerciseLists {
  loadedAt: number | null;
  status: Status;
  error: string | null;
}

const initialState: ListsState = {
  muscles: [],
  equipments: [],
  loadedAt: null,
  status: "idle",
  error: null,
};

const TTL = 10 * 60 * 1000;

export const ensureListsLoaded = createAsyncThunk(
  "lists/ensureLoaded",
  async (_, { getState }) => {
    const state = getState() as { lists: ListsState };
    const { loadedAt } = state.lists;
    const fresh = loadedAt && Date.now() - loadedAt < TTL;

    const data = await getExerciseLists({ force: !fresh });
    return data;
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(ensureListsLoaded.pending, (state) => {
        if (state.muscles.length === 0 && state.equipments.length === 0) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(ensureListsLoaded.fulfilled, (state, action: PayloadAction<ExerciseLists>) => {
        state.muscles = action.payload.muscles ?? [];
        state.equipments = action.payload.equipments ?? [];
        state.loadedAt = Date.now();
        state.status = "succeeded";
      })
      .addCase(ensureListsLoaded.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.error?.message as string) ?? "Failed to load lists";
      });
  },
});

export const listsReducer = listsSlice.reducer;

// selectors
export const selectMuscles = (s: { lists: ListsState }) => s.lists.muscles;
export const selectEquipments = (s: { lists: ListsState }) => s.lists.equipments;
export const selectListsStatus = (s: { lists: ListsState }) => s.lists.status;
export const selectHasLists = (s: { lists: ListsState }) =>
  s.lists.muscles.length > 0 || s.lists.equipments.length > 0;
