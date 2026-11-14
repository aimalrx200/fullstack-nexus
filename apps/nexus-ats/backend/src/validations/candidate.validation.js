import { z } from "zod";

export const applyCandidateSchema = {
  body: z.object({
    jobId: z.string({ required_error: "Target Job ID is required" }).min(1),
    name: z
      .string({ required_error: "Full name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    phone: z.string().optional().default(""),
    location: z.string().optional().default("Remote"),
    websiteOrProfile: z.string().optional().default(""),
  }),
};

export const updateStageSchema = {
  params: z.object({
    id: z.string().min(1, "Candidate ID is required"),
  }),
  body: z.object({
    newStageId: z.enum(
      ["applied", "screen", "interview", "offer", "rejected"],
      {
        required_error: "Valid stage is required",
      },
    ),
  }),
};

export const updateRatingSchema = {
  params: z.object({
    id: z.string().min(1, "Candidate ID is required"),
  }),
  body: z.object({
    score: z.coerce.number().min(0).max(5),
  }),
};

export const updateScorecardSchema = {
  params: z.object({
    id: z.string().min(1, "Candidate ID is required"),
  }),
  body: z.object({
    technical: z.coerce.number().min(0).max(5).default(0),
    communication: z.coerce.number().min(0).max(5).default(0),
    systemDesign: z.coerce.number().min(0).max(5).default(0),
    recommendation: z.enum([
      "Strong Hire",
      "Hire",
      "Review Required",
      "Do Not Hire",
    ]),
  }),
};

export const addNoteSchema = {
  params: z.object({
    id: z.string().min(1, "Candidate ID is required"),
  }),
  body: z.object({
    author: z.string().optional().default("Alex Sterling (Recruiter)"),
    text: z
      .string({ required_error: "Feedback note text is required" })
      .min(2, "Note must be at least 2 characters")
      .max(2500),
  }),
};
