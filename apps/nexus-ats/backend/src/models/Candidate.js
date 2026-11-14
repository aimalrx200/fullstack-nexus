import mongoose from "mongoose";

const noteSubSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () =>
        `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: "Alex Sterling (Recruiter)",
    },
    avatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Note text cannot be empty"],
      trim: true,
      maxlength: [2500, "Note text cannot exceed 2500 characters"],
    },
    createdAt: {
      type: String,
      default: () =>
        new Date().toISOString().replace("T", " ").substring(0, 16),
    },
  },
  { _id: false },
);

const timelineSubSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () =>
        `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "application_submitted",
        "stage_change",
        "scorecard_updated",
        "note_added",
      ],
      default: "stage_change",
    },
    stage: {
      type: String,
      enum: ["applied", "screen", "interview", "offer", "rejected"],
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { _id: false },
);

const scorecardSubSchema = new mongoose.Schema(
  {
    technical: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    communication: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    systemDesign: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    recommendation: {
      type: String,
      enum: ["Strong Hire", "Hire", "Review Required", "Do Not Hire"],
      default: "Review Required",
    },
  },
  { _id: false },
);

const candidateSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Candidate must be linked to a target job requisition"],
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Target job title snapshot is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Candidate email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "Remote",
    },
    avatar: {
      type: String,
      default: "",
    },
    stage: {
      type: String,
      required: true,
      enum: ["applied", "screen", "interview", "offer", "rejected"],
      default: "applied",
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true,
    },
    appliedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
      index: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 3,
    },
    expectedSalary: {
      type: String,
      trim: true,
      default: "Negotiable",
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: ["Inbound Applicant"],
      index: true,
    },
    scorecard: {
      type: scorecardSubSchema,
      default: () => ({}),
    },
    notes: {
      type: [noteSubSchema],
      default: [],
    },
    timeline: {
      type: [timelineSubSchema],
      default: () => [
        {
          id: `tl_${Date.now()}`,
          type: "application_submitted",
          note: "Inbound application received via Nexus Careers Portal",
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.score = ret.rating; // Compatibility alias for frontend score property
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// High-throughput query indexes
candidateSchema.index({ jobId: 1, stage: 1 });
candidateSchema.index({ name: "text", email: "text", jobTitle: "text" });

export const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
