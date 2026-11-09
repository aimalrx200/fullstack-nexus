// apps/nexus-ats/frontend/src/redux/slices/candidateSlice.js

import { createSlice } from "@reduxjs/toolkit";
import * as candidatesModule from "@/lib/mockData/candidates.mock";

// Safely resolve whether it was exported as MOCK_CANDIDATES, CANDIDATES, or default
const initialCandidates =
  candidatesModule.MOCK_CANDIDATES ||
  candidatesModule.CANDIDATES ||
  candidatesModule.default ||
  [];

const initialState = {
  items: initialCandidates,
  selectedCandidateId: null,
  pipelineSearchQuery: "",
  selectedStageFilter: "all",
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    moveCandidateStage: (state, action) => {
      const { candidateId, newStageId } = action.payload;
      const candidate = state.items.find((c) => c.id === candidateId);
      if (candidate && candidate.stage !== newStageId) {
        candidate.stage = newStageId;
        candidate.updatedAt = new Date().toISOString();
        if (!candidate.timeline) candidate.timeline = [];
        candidate.timeline.unshift({
          id: `tl_${Date.now()}`,
          type: "stage_change",
          stage: newStageId,
          timestamp: new Date().toISOString(),
          note: `Moved to ${newStageId.toUpperCase()} stage`,
        });
      }
    },
    setSelectedCandidateId: (state, action) => {
      state.selectedCandidateId = action.payload;
    },
    clearSelectedCandidate: (state) => {
      state.selectedCandidateId = null;
    },
    addCandidate: (state, action) => {
      const newCandidate = {
        id: `cand_${Date.now()}`,
        stage: "applied",
        score: 0,
        rating: 0,
        tags: ["New Applicant"],
        notes: [],
        timeline: [
          {
            id: `tl_${Date.now()}`,
            type: "application_submitted",
            timestamp: new Date().toISOString(),
            note: "Application received via Careers Portal",
          },
        ],
        appliedAt: new Date().toISOString(),
        ...action.payload,
      };
      state.items.unshift(newCandidate);
    },
    addCandidateNote: (state, action) => {
      const { candidateId, author, text } = action.payload;
      const candidate = state.items.find((c) => c.id === candidateId);
      if (candidate) {
        if (!candidate.notes) candidate.notes = [];
        candidate.notes.unshift({
          id: `note_${Date.now()}`,
          author: author || "Recruiter",
          text,
          createdAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
        });
      }
    },
    updateCandidateRating: (state, action) => {
      const { candidateId, score } = action.payload;
      const candidate = state.items.find((c) => c.id === candidateId);
      if (candidate) {
        candidate.score = score;
        candidate.rating = score;
        if (!candidate.scorecard) {
          candidate.scorecard = {
            technical: score,
            communication: score,
            systemDesign: score,
            recommendation: score >= 4 ? "Hire" : "Review Required",
          };
        } else {
          candidate.scorecard.technical = score;
          candidate.scorecard.recommendation =
            score >= 4
              ? "Strong Hire"
              : score === 3
                ? "Hire"
                : "Review Required";
        }
      }
    },
    setPipelineSearchQuery: (state, action) => {
      state.pipelineSearchQuery = action.payload;
    },
    setSelectedStageFilter: (state, action) => {
      state.selectedStageFilter = action.payload;
    },
  },
});

export const {
  moveCandidateStage,
  setSelectedCandidateId,
  clearSelectedCandidate,
  addCandidate,
  addCandidateNote,
  updateCandidateRating,
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
