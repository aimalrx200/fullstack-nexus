import { Router } from "express";
import {
  getJobs,
  getJobBySlugOrId,
  createJob,
  updateJobStatus,
} from "#controllers/jobs/job.controller.js";
import { protectRecruiter } from "#middlewares/authMiddleware.js";
import { validate } from "#middlewares/validate.js";
import {
  createJobSchema,
  updateJobStatusSchema,
  getJobsQuerySchema,
} from "#validations/job.validation.js";

export const jobRouter = Router();

jobRouter.get("/", validate(getJobsQuerySchema), getJobs);
jobRouter.get("/:slugOrId", getJobBySlugOrId);
jobRouter.post("/", protectRecruiter, validate(createJobSchema), createJob);
jobRouter.patch(
  "/:id/status",
  protectRecruiter,
  validate(updateJobStatusSchema),
  updateJobStatus,
);
