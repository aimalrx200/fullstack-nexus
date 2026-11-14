import { Candidate } from "#models/Candidate.js";

/**
 * Moves candidate to a new stage and appends an audit event to the timeline
 */
export const moveCandidateStage = async (candidateId, newStageId) => {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    const error = new Error("Candidate dossier not found");
    error.statusCode = 404;
    throw error;
  }

  if (candidate.stage === newStageId) {
    return candidate;
  }

  const previousStage = candidate.stage;
  candidate.stage = newStageId;

  candidate.timeline.unshift({
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "stage_change",
    stage: newStageId,
    note: `Candidate advanced from ${previousStage.toUpperCase()} to ${newStageId.toUpperCase()} stage`,
    timestamp: new Date().toISOString(),
  });

  return candidate.save();
};

/**
 * Adds a recruiter feedback note to the candidate profile and logs it in the timeline
 */
export const appendCandidateNote = async (
  candidateId,
  { author, avatar, text },
) => {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    const error = new Error("Candidate dossier not found");
    error.statusCode = 404;
    throw error;
  }

  candidate.notes.unshift({
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    author: author || "Alex Sterling (Recruiter)",
    avatar: avatar || "",
    text,
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
  });

  candidate.timeline.unshift({
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "note_added",
    note: `Recruiter feedback note recorded by ${author || "Recruiter"}`,
    timestamp: new Date().toISOString(),
  });

  return candidate.save();
};

/**
 * Updates candidate competency ratings and recommendation
 */
export const updateCandidateScorecard = async (
  candidateId,
  { technical, communication, systemDesign, recommendation },
) => {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    const error = new Error("Candidate dossier not found");
    error.statusCode = 404;
    throw error;
  }

  candidate.scorecard = {
    technical,
    communication,
    systemDesign,
    recommendation,
  };

  // Derive composite 1-5 star score
  const computedRating =
    Math.round((technical + communication + systemDesign) / 3) || 1;
  candidate.rating = computedRating;

  candidate.timeline.unshift({
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "scorecard_updated",
    note: `Scorecard updated: ${recommendation} (${computedRating}/5 stars)`,
    timestamp: new Date().toISOString(),
  });

  return candidate.save();
};
