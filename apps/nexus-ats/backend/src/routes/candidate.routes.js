import { Router } from "express";
import {
  applyForJob,
  getCandidates,
  getCandidateById,
  updateStage,
  updateRating,
  updateScorecard,
  addNote,
} from "#controllers/candidates/candidate.controller.js";
import { protectRecruiter } from "#middlewares/authMiddleware.js";
import { uploadCV } from "#middlewares/upload.js";
import { validate } from "#middlewares/validate.js";
import { applyRateLimiter } from "#config/rateLimiter.js";
import {
  applyCandidateSchema,
  updateStageSchema,
  updateRatingSchema,
  updateScorecardSchema,
  addNoteSchema,
} from "#validations/candidate.validation.js";

export const candidateRouter = Router();

// Public Candidate Intake
candidateRouter.post(
  "/apply",
  applyRateLimiter,
  uploadCV.single("resume"),
  validate(applyCandidateSchema),
  applyForJob,
);

// Protected Recruiter Operations
candidateRouter.get("/", protectRecruiter, getCandidates);
candidateRouter.get("/:id", protectRecruiter, getCandidateById);
candidateRouter.patch(
  "/:id/stage",
  protectRecruiter,
  validate(updateStageSchema),
  updateStage,
);
candidateRouter.patch(
  "/:id/rating",
  protectRecruiter,
  validate(updateRatingSchema),
  updateRating,
);
candidateRouter.patch(
  "/:id/scorecard",
  protectRecruiter,
  validate(updateScorecardSchema),
  updateScorecard,
);
candidateRouter.post(
  "/:id/notes",
  protectRecruiter,
  validate(addNoteSchema),
  addNote,
);
