import { Candidate } from "#models/Candidate.js";
import { Job } from "#models/Job.js";
import { uploadCandidateCV } from "#services/cloudinaryService.js";
import {
  moveCandidateStage,
  appendCandidateNote,
  updateCandidateScorecard,
} from "#services/candidateService.js";
import { sanitizeText } from "#utils/sanitize.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * @route   POST /api/v1/candidates/apply
 * @desc    Submit application with PDF resume (Multer memory -> Cloudinary)
 * @access  Public
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const { jobId, name, email, phone, location, websiteOrProfile } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Target job requisition does not exist",
    });
  }

  // Upload CV to Cloudinary (or local disk in dev)
  const resumeUrl = await uploadCandidateCV(req.file, name);

  const newCandidate = await Candidate.create({
    jobId: job._id,
    jobTitle: job.title,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : "",
    location: location ? location.trim() : job.location,
    avatar: "",
    stage: "applied",
    rating: 0,
    appliedDate: new Date().toISOString().split("T")[0],
    experienceYears: 3,
    expectedSalary: job.salaryRange || "Negotiable",
    resumeUrl,
    portfolioUrl: websiteOrProfile ? websiteOrProfile.trim() : "",
    tags: [job.department, "Inbound Applicant"],
    scorecard: {
      technical: 0,
      communication: 0,
      systemDesign: 0,
      recommendation: "Review Required",
    },
    notes: [],
    timeline: [
      {
        id: `tl_${Date.now()}`,
        type: "application_submitted",
        note: `Inbound application received for ${job.title}`,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  // Atomically increment job applicant count
  await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

  res.status(201).json({
    success: true,
    message: `Application submitted successfully for ${job.title}`,
    candidate: newCandidate,
  });
});

/**
 * @route   GET /api/v1/candidates
 * @desc    Retrieve candidates with search, stage, and job filters
 * @access  Recruiter
 */
export const getCandidates = asyncHandler(async (req, res) => {
  const { jobId, stage, search } = req.query;
  const filter = {};

  if (jobId && jobId !== "all") {
    filter.jobId = jobId;
  }
  if (stage && stage !== "all") {
    filter.stage = stage;
  }
  if (search && search.trim() !== "") {
    const q = search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { jobTitle: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ];
  }

  const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: candidates.length,
    candidates,
  });
});

/**
 * @route   GET /api/v1/candidates/:id
 * @desc    Get complete candidate dossier (scorecard, notes, timeline)
 * @access  Recruiter
 */
export const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({
      success: false,
      message: "Candidate dossier not found",
    });
  }

  res.status(200).json({
    success: true,
    candidate,
  });
});

/**
 * @route   PATCH /api/v1/candidates/:id/stage
 * @desc    Kanban drag-and-drop: updates stage & logs timeline event
 * @access  Recruiter
 */
export const updateStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newStageId } = req.body;

  const candidate = await moveCandidateStage(id, newStageId);

  res.status(200).json({
    success: true,
    message: `Candidate moved to ${newStageId.toUpperCase()}`,
    candidate,
  });
});

/**
 * @route   PATCH /api/v1/candidates/:id/rating
 * @desc    Update candidate 1-5 star competency score
 * @access  Recruiter
 */
export const updateRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;

  const candidate = await Candidate.findById(id);
  if (!candidate) {
    return res.status(404).json({
      success: false,
      message: "Candidate dossier not found",
    });
  }

  candidate.rating = score;
  candidate.scorecard.technical = score;
  candidate.scorecard.recommendation =
    score >= 4 ? "Strong Hire" : score === 3 ? "Hire" : "Review Required";

  candidate.timeline.unshift({
    id: `tl_${Date.now()}`,
    type: "scorecard_updated",
    note: `Quick competency rating updated to ${score}/5 stars`,
    timestamp: new Date().toISOString(),
  });

  await candidate.save();

  res.status(200).json({
    success: true,
    message: `Competency rating updated to ${score}/5`,
    candidate,
  });
});

/**
 * @route   PATCH /api/v1/candidates/:id/scorecard
 * @desc    Update sub-criteria ratings and hiring recommendation
 * @access  Recruiter
 */
export const updateScorecard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidate = await updateCandidateScorecard(id, req.body);

  res.status(200).json({
    success: true,
    message: "Scorecard evaluation recorded successfully",
    candidate,
  });
});

/**
 * @route   POST /api/v1/candidates/:id/notes
 * @desc    Record recruiter interview feedback note
 * @access  Recruiter
 */
export const addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const candidate = await appendCandidateNote(id, {
    author: req.user
      ? `${req.user.name} (Recruiter)`
      : "Alex Sterling (Recruiter)",
    avatar: req.user?.avatar || "",
    text: sanitizeText(text),
  });

  res.status(201).json({
    success: true,
    message: "Recruiter note recorded",
    candidate,
  });
});
