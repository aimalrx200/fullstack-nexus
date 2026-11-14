import mongoose from "mongoose";
import { Job } from "#models/Job.js";
import { slugify } from "#utils/slugify.js";
import { sanitizeText } from "#utils/sanitize.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * @route   GET /api/v1/jobs
 * @desc    List all public or recruiter job requisitions with filters
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  const { department, workplaceType, status, search } = req.query;

  const filter = {};

  if (department && department !== "All Departments") {
    filter.department = department;
  }
  if (workplaceType && workplaceType !== "All Locations") {
    filter.workplaceType = workplaceType;
  }
  if (status && status !== "All Statuses") {
    filter.status = status;
  }
  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { summary: { $regex: search.trim(), $options: "i" } },
      { location: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

/**
 * @route   GET /api/v1/jobs/:slugOrId
 * @desc    Get single job by unique slug or ObjectId
 * @access  Public
 */
export const getJobBySlugOrId = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;

  const query = mongoose.Types.ObjectId.isValid(slugOrId)
    ? { _id: slugOrId }
    : { slug: slugOrId.toLowerCase() };

  const job = await Job.findOne(query);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job requisition not found",
    });
  }

  res.status(200).json({
    success: true,
    job,
  });
});

/**
 * @route   POST /api/v1/jobs
 * @desc    Publish a new job requisition
 * @access  Recruiter
 */
export const createJob = asyncHandler(async (req, res) => {
  const { title, summary, responsibilities, requirements, benefits, ...rest } =
    req.body;

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const job = await Job.create({
    ...rest,
    title: title.trim(),
    slug,
    summary: sanitizeText(summary),
    responsibilities: responsibilities || [],
    requirements: requirements || [],
    benefits: benefits || [],
    status: "Active",
    postedDate: new Date().toISOString().split("T")[0],
    applicantCount: 0,
  });

  res.status(201).json({
    success: true,
    message: `Job requisition "${job.title}" published successfully`,
    job,
  });
});

/**
 * @route   PATCH /api/v1/jobs/:id/status
 * @desc    Toggle job status (Active / Paused / Archived)
 * @access  Recruiter
 */
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job requisition not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `Requisition status updated to ${status}`,
    job,
  });
});
