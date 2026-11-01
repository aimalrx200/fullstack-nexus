// apps/nexus-ats/frontend/src/redux/slices/jobSlice.js

import { createSlice } from "@reduxjs/toolkit";
import * as jobsModule from "@/lib/mockData/jobs.mock";

// Safely resolve whether it was exported as MOCK_JOBS, JOBS, or default
const initialJobs =
  jobsModule.MOCK_JOBS || jobsModule.JOBS || jobsModule.default || [];

const initialState = {
  items: initialJobs,
  selectedJobId: "all", // 'all' or specific job ID
  departmentFilter: "all",
  typeFilter: "all",
  searchQuery: "",
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setSelectedJobId: (state, action) => {
      state.selectedJobId = action.payload;
    },
    createJob: (state, action) => {
      const newJob = {
        id: `job_${Date.now()}`,
        status: "active",
        createdAt: new Date().toISOString(),
        applicantsCount: 0,
        ...action.payload,
      };
      state.items.unshift(newJob);
    },
    updateJobStatus: (state, action) => {
      const { jobId, status } = action.payload;
      const target = state.items.find((j) => j.id === jobId);
      if (target) {
        target.status = status;
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
});

export const {
  setSelectedJobId,
  createJob,
  updateJobStatus,
  setDepartmentFilter,
  setTypeFilter,
  setJobSearchQuery,
} = jobSlice.actions;

export const selectAllJobs = (state) => state.jobs.items;
export const selectSelectedJobId = (state) => state.jobs.selectedJobId;
export const selectJobById = (id) => (state) =>
  state.jobs.items.find((j) => j.id === id);

export default jobSlice.reducer;
