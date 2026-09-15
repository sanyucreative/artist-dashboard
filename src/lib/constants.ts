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

export function titleCase(s: string) {
  return s
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
