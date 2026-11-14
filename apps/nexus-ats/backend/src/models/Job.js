import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [120, "Job title cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Job slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: ["Engineering", "Product", "Design", "DevSecOps", "Marketing"],
        message: "{VALUE} is not a supported department",
      },
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      default: "Remote",
    },
    workplaceType: {
      type: String,
      required: true,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Remote",
      index: true,
    },
    employmentType: {
      type: String,
      required: true,
      enum: ["Full-time", "Contract", "Part-time", "Internship"],
      default: "Full-time",
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["Junior", "Mid-Level", "Senior", "Staff / Lead"],
      default: "Senior",
    },
    salaryRange: {
      type: String,
      required: [true, "Salary range is required"],
      trim: true,
      default: "$130,000 - $160,000 USD",
    },
    applicantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Paused", "Archived"],
      default: "Active",
      index: true,
    },
    postedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    summary: {
      type: String,
      required: [true, "Role summary is required"],
      trim: true,
      maxlength: [2000, "Summary cannot exceed 2000 characters"],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index for high-velocity public catalog search and filtering
jobSchema.index({ department: 1, status: 1, workplaceType: 1 });

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
