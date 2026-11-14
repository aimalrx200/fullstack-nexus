// apps/nexus-ats/frontend/src/redux/slices/jobSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jobApi } from "@/lib/api/jobApi";

/**
 * Fetch jobs from live API with filters
 */
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await jobApi.getJobs(filters);
      return data.jobs || [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load jobs");
    }
  },
);

/**
 * Publish a new job requisition
 */
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobPayload, { rejectWithValue }) => {
    try {
      const data = await jobApi.createJob(jobPayload);
      return data.job;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create requisition");
    }
  },
);

/**
 * Toggle job status: Active | Paused | Archived
 */
export const updateJobStatus = createAsyncThunk(
  "jobs/updateJobStatus",
  async ({ jobId, status }, { rejectWithValue }) => {
    try {
      const data = await jobApi.updateJobStatus(jobId, status);
      return data.job;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update status");
    }
  },
);

const initialState = {
  items: [],
  selectedJobId: "all",
  departmentFilter: "all",
  typeFilter: "all",
  searchQuery: "",
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setSelectedJobId: (state, action) => {
      state.selectedJobId = action.payload;
    },
    incrementApplicantCount: (state, action) => {
      const target = state.items.find((j) => j.id === action.payload);
      if (target) {
        target.applicantCount = (target.applicantCount || 0) + 1;
      }
    },
    setDepartmentFilter: (state, action) => {
      state.departmentFilter = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    setJobSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Job
      .addCase(createJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // Update Job Status
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((j) => j.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      });
  },
});

export const {
  setSelectedJobId,
  incrementApplicantCount,
  setDepartmentFilter,
  setTypeFilter,
  setJobSearchQuery,
} = jobSlice.actions;

export const selectAllJobs = (state) => state.jobs.items;
export const selectSelectedJobId = (state) => state.jobs.selectedJobId;
export const selectJobById = (id) => (state) =>
  state.jobs.items.find((j) => j.id === id);

export default jobSlice.reducer;
