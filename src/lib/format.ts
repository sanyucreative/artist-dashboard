// Fields entered via <input type="date"> (deadlines, due dates, CV entry
// dates, reapply dates, ...) are stored as UTC-midnight timestamps. Reading
// them back with a plain .toLocaleDateString() converts to the viewer's
// local timezone first, which can silently shift the displayed calendar day
// backward by one for any timezone behind UTC. These are calendar dates,
// not moments in time, so every display of one must pin timeZone: "UTC" --
// use these helpers instead of calling .toLocaleDateString() directly on a
// date-only field. Real timestamps (submittedAt, decisionAt, createdAt) are
// not affected and should keep using local time as normal.
export function formatDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(date).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}

export function formatShortDate(date: Date | string) {
  return formatDate(date, { month: "short", day: "numeric" });
}

export function formatFullDate(date: Date | string) {
  return formatDate(date, { year: "numeric", month: "short", day: "numeric" });
}

export function dateYearUTC(date: Date | string) {
  return new Date(date).getUTCFullYear();
}
