import { z } from "zod";

export const createJobSchema = {
  body: z.object({
    title: z
      .string({ required_error: "Role title is required" })
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title cannot exceed 120 characters")
      .trim(),
    department: z.enum(
      ["Engineering", "Product", "Design", "DevSecOps", "Marketing"],
      {
        required_error: "Department is required",
      },
    ),
    location: z.string().default("Remote"),
    workplaceType: z.enum(["Remote", "Hybrid", "On-site"]).default("Remote"),
    employmentType: z
      .enum(["Full-time", "Contract", "Part-time", "Internship"])
      .default("Full-time"),
    experienceLevel: z
      .enum(["Junior", "Mid-Level", "Senior", "Staff / Lead"])
      .default("Senior"),
    salaryRange: z.string().default("$130,000 - $160,000 USD"),
    summary: z
      .string({ required_error: "Role summary is required" })
      .min(20, "Summary must be at least 20 characters")
      .max(2000, "Summary cannot exceed 2000 characters"),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
  }),
};

export const updateJobStatusSchema = {
  params: z.object({
    id: z.string().min(1, "Job ID is required"),
  }),
  body: z.object({
    status: z.enum(["Active", "Paused", "Archived"], {
      required_error: "Status must be Active, Paused, or Archived",
    }),
  }),
};

export const getJobsQuerySchema = {
  query: z.object({
    department: z.string().optional(),
    workplaceType: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
  }),
};
