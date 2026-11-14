// apps/nexus-ats/frontend/src/redux/slices/candidateSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { candidateApi } from "@/lib/api/candidateApi";

/**
 * Fetch candidates from live API
 */
export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await candidateApi.getCandidates(filters);
      return data.candidates || [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load talent pool");
    }
  },
);

/**
 * Kanban Drag-and-Drop: Optimistic Stage Shift
 */
export const moveCandidateStage = createAsyncThunk(
  "candidates/moveCandidateStage",
  async ({ candidateId, newStageId }, { rejectWithValue }) => {
    try {
      const data = await candidateApi.updateStage(candidateId, newStageId);
      return data.candidate;
    } catch (err) {
      return rejectWithValue({
        candidateId,
        message: err.message || "Failed to update stage",
      });
    }
  },
);

/**
 * Update 1-5 Star Competency Rating
 */
export const updateCandidateRating = createAsyncThunk(
  "candidates/updateCandidateRating",
  async ({ candidateId, score }, { rejectWithValue }) => {
    try {
      const data = await candidateApi.updateRating(candidateId, score);
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update score");
    }
  },
);

/**
 * Update Competency Scorecard & Recommendation
 */
export const updateCandidateScorecard = createAsyncThunk(
  "candidates/updateCandidateScorecard",
  async ({ candidateId, scorecardData }, { rejectWithValue }) => {
    try {
      const data = await candidateApi.updateScorecard(
        candidateId,
        scorecardData,
      );
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to save scorecard");
    }
  },
);

/**
 * Record Recruiter Feedback Note
 */
export const addCandidateNote = createAsyncThunk(
  "candidates/addCandidateNote",
  async ({ candidateId, text }, { rejectWithValue }) => {
    try {
      const data = await candidateApi.addNote(candidateId, { text });
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to record note");
    }
  },
);

/**
 * Submit Inbound Candidate Application (Multipart FormData)
 */
export const applyForJob = createAsyncThunk(
  "candidates/applyForJob",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await candidateApi.applyForJob(formData);
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.message || "Application submission failed");
    }
  },
);

const initialState = {
  items: [],
  selectedCandidateId: null,
  pipelineSearchQuery: "",
  selectedStageFilter: "all",
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setSelectedCandidateId: (state, action) => {
      state.selectedCandidateId = action.payload;
    },
    clearSelectedCandidate: (state) => {
      state.selectedCandidateId = null;
    },
    setPipelineSearchQuery: (state, action) => {
      state.pipelineSearchQuery = action.payload;
    },
    setSelectedStageFilter: (state, action) => {
      state.selectedStageFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Candidates
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Optimistic Move Stage (Instant 60fps UI feedback on drop)
      .addCase(moveCandidateStage.pending, (state, action) => {
        const { candidateId, newStageId } = action.meta.arg;
        const candidate = state.items.find((c) => c.id === candidateId);
        if (candidate) {
          candidate._prevStage = candidate.stage;
          candidate.stage = newStageId;
        }
      })
      .addCase(moveCandidateStage.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((c) => c.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      .addCase(moveCandidateStage.rejected, (state, action) => {
        // Rollback stage on failure
        const { candidateId } = action.meta.arg;
        const candidate = state.items.find((c) => c.id === candidateId);
        if (candidate && candidate._prevStage) {
          candidate.stage = candidate._prevStage;
          delete candidate._prevStage;
        }
        state.error = action.payload?.message;
      })

      // Updates (Rating, Scorecard, Notes)
      .addCase(updateCandidateRating.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((c) => c.id === updated.id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(updateCandidateScorecard.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((c) => c.id === updated.id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(addCandidateNote.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((c) => c.id === updated.id);
        if (index !== -1) state.items[index] = updated;
      })

      // Inbound apply
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const {
  setSelectedCandidateId,
  clearSelectedCandidate,
  setPipelineSearchQuery,
  setSelectedStageFilter,
} = candidateSlice.actions;

export const selectAllCandidates = (state) => state.candidates.items;
export const selectSelectedCandidateId = (state) =>
  state.candidates.selectedCandidateId;
export const selectActiveCandidate = (state) =>
  state.candidates.items.find(
    (c) => c.id === state.candidates.selectedCandidateId,
  );

export default candidateSlice.reducer;
