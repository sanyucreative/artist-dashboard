export const OPPORTUNITY_TYPES = [
  "grant",
  "residency",
  "fellowship",
  "exhibition_call",
  "commission",
  "mentorship",
  "award",
] as const;

export const APPLICATION_STATUSES = ["researching", "drafting", "submitted", "under_review", "decision"] as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  researching: "Researching",
  drafting: "Drafting",
  submitted: "Submitted",
  under_review: "Under review",
  decision: "Decision",
};

export const OUTCOMES = ["accepted", "declined", "ineligible", "withdrawn", "waitlisted", "no_response"] as const;

export const OUTCOME_REASON_CODES = [
  "eligibility_not_met",
  "insufficient_documentation",
  "competitive_pool",
  "lottery",
  "budget_scope",
  "weak_work_samples",
  "misaligned_with_program",
  "no_reason_given",
  "other",
] as const;

export const OUTCOME_REASON_LABELS: Record<string, string> = {
  eligibility_not_met: "Eligibility not met",
  insufficient_documentation: "Insufficient documentation",
  competitive_pool: "Competitive pool",
  lottery: "Lottery / long odds",
  budget_scope: "Budget or scope mismatch",
  weak_work_samples: "Work samples too weak",
  misaligned_with_program: "Misaligned with program",
  no_reason_given: "No reason given",
  other: "Other",
};

export const PROJECT_STATUSES = ["active", "dormant", "complete", "ongoing"] as const;

export const CONSENT_STATUSES = ["not_requested", "requested", "granted", "declined", "expired"] as const;

export const CONSENT_STATUS_LABELS: Record<string, string> = {
  not_requested: "Not requested",
  requested: "Requested",
  granted: "Granted",
  declined: "Declined",
  expired: "Expired",
};

export const MILESTONE_STATUSES = ["planned", "in_progress", "done"] as const;

export const ASSET_TYPES = [
  "image",
  "work_sample",
  "artist_statement",
  "bio",
  "cv",
  "budget",
  "letter_of_support",
  "other",
] as const;

export const ASSET_TYPE_LABELS: Record<string, string> = {
  image: "Image",
  work_sample: "Work sample",
  artist_statement: "Artist statement",
  bio: "Bio",
  cv: "CV",
  budget: "Budget",
  letter_of_support: "Letter of support",
  other: "Other",
};

// The image-ish types that render as a grid; everything else is a document
// list, per spec ("Grid for images, list for documents").
export const VISUAL_ASSET_TYPES = new Set(["image", "work_sample"]);

// Statements and bios are versioned, per spec -- these are grouped together
// in the UI so every version of the "same" asset shows in one place.
export const VERSIONED_ASSET_TYPES = new Set(["artist_statement", "bio"]);

export const CV_CATEGORIES = ["exhibition", "award", "residency", "publication", "talk", "press"] as const;

export function titleCase(s: string) {
  return s
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
