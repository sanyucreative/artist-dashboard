# Build Spec: Artist CRM / Practice Dashboard

## What to build

A web app that lets working artists across disciplines (visual art, photography, writing, performance, music, design) manage grant and opportunity applications, deadlines, and the projects those applications draw from, in one place.

The core insight: existing tools split this job in two. Artsume tracks applications and syncs a CV but has no project layer. Artwork Archive manages inventory and sales but treats deadlines as an afterthought. Neither connects an application to the body of work behind it. That connection is the point of this app.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Postgres via Prisma
- Auth: email magic link (NextAuth or equivalent)
- File storage: S3-compatible bucket for work samples and documents
- Deploy target: Vercel

Build it as a single repo. Seed the database with realistic sample data so the UI can be evaluated immediately.

## Data model

**User**
- id, name, email, disciplines (multi-select), timezone, createdAt

**Workspace**
- id, userId, name, type (e.g. "art practice", "design studio")
- A user can have more than one. All records below belong to exactly one workspace.
- Purpose: artists who keep a professional identity separate from their art practice need these not to bleed together.

**Project**
- id, workspaceId, title, workingTitle, status (active / dormant / complete / ongoing)
- description, startDate, medium, themes (tags)
- isOngoing (boolean) — some projects are designed to keep growing and never close; the UI must not push these toward "complete"
- Relations: participants, assets, exhibitions, applications, milestones

**Participant**
- id, projectId, name, role, contactEmail, consentStatus, notes
- consentStatus matters: model releases, oral history permissions, image use rights

**Opportunity**
- id, workspaceId, name, organization, type (grant / residency / fellowship / exhibition call / commission / mentorship / award)
- url, deadline, notifyAt, feeAmount, awardAmount, discipline, eligibilityNotes
- isRecurring, recurrenceCadence — most open annually; the app should be able to roll a missed one forward

**Application**
- id, opportunityId, workspaceId, projectIds (many-to-many)
- status: researching → drafting → submitted → under review → decision
- submittedAt, decisionAt
- outcome: accepted / declined / ineligible / withdrawn / waitlisted / no response
- outcomeReason (free text) and outcomeReasonCode (enum below)
- canReapply (boolean), reapplyDate
- assetsUsed (many-to-many with Asset) — which images, statements, and CV version went in
- feedbackReceived (text)

**outcomeReasonCode enum**
`eligibility_not_met`, `insufficient_documentation`, `competitive_pool`, `lottery`, `budget_scope`, `weak_work_samples`, `misaligned_with_program`, `no_reason_given`, `other`

This enum is the most important design decision in the app. Artists re-learn the same rejection reasons every cycle because the reason lives in an email nobody re-reads. Capturing it structurally is what makes the analytics view worth anything.

**Asset**
- id, workspaceId, type (image / artist_statement / bio / cv / work_sample / budget / letter_of_support / other)
- title, fileUrl, version, projectId (nullable), createdAt, notes
- Statements and bios are versioned. An artist rewrites their statement for each application; they need to see which version went where.

**CVEntry**
- id, workspaceId, category (exhibition / award / residency / publication / talk / press)
- title, organization, location, date, description
- sourceApplicationId (nullable) — auto-created when an application outcome is set to accepted
- isPublic (boolean)

**Milestone**
- id, projectId, title, dueDate, status, notes
- Project work, not application work. Shoots, edits, print runs, install dates.

**Contact**
- id, workspaceId, name, organization, role, email, phone, relationshipType (funder / curator / gallerist / collaborator / mentor / press), notes, lastContactedAt

## Screens

**1. Dashboard (home)**
Three panels above the fold:
- Deadlines in the next 30 days, application deadlines and project milestones interleaved on one list, not separate. Scheduling conflict is the actual problem being solved.
- Applications awaiting a decision, with days elapsed since submission
- Quick-add button for a new opportunity

Below: this cycle's counts (submitted, accepted, declined, pending).

**2. Opportunities**
- Table and calendar toggle
- Filters: discipline, deadline range, type, fee, has-been-applied-to
- Each row expands to show eligibility notes and past applications to the same opportunity
- Bulk import from CSV, since most artists arrive with a spreadsheet

**3. Application detail**
- Status pipeline as a visual stepper
- Linked projects
- Assets used, with the exact version of each statement or bio
- Outcome block: reason code, free-text reason, feedback received, can-reapply toggle with a date
- A "what I'd change" notes field, written at decision time while it's fresh

**4. Projects**
- Card grid, each card showing title, status, participant count, linked application count
- Project detail: description, themes, participants with consent status, assets, exhibition history, milestones, and every application that drew on this project

**5. Assets library**
- Grid for images, list for documents
- Version history on statements and bios
- Filter by project
- "Used in" back-reference on every asset

**6. CV**
- Auto-populated from accepted applications and exhibition records
- Manual entries allowed
- Export to PDF and to plain text for pasting into application forms

**7. Insights**
- Acceptance rate overall and by opportunity type
- Rejection reasons grouped by reason code — the "why this keeps happening" view
- Applications per month against acceptances, to show effort versus return
- Upcoming reapply-eligible opportunities from past declines

**8. Contacts**
- Simple CRM list, filterable by relationship type
- Link contacts to opportunities and projects

## Behaviors that matter

- **Deadline notifications.** Email at 30, 14, 7, and 1 days out. Configurable per opportunity.
- **Reapply surfacing.** When an application is marked declined with canReapply true, the opportunity automatically reappears in the dashboard when its next cycle opens.
- **Eligibility checklist.** Free-text eligibility notes per opportunity, with a checkbox list the artist fills in before submitting. Many rejections come from eligibility criteria the artist could have verified in advance, such as a required number of years of documented public practice.
- **Asset reuse.** When starting a new application, show assets used in prior applications to similar opportunity types as suggested starting points.
- **Nothing auto-closes.** Ongoing projects stay ongoing. No UI nudge toward marking a project finished.

## Build order

1. Schema, migrations, seed data
2. Auth and workspace switching
3. Opportunities CRUD, including CSV import
4. Applications CRUD with the status pipeline and outcome capture
5. Projects CRUD and the project-to-application linking
6. Assets library with versioning
7. Dashboard assembling the above
8. CV auto-population and export
9. Insights
10. Contacts
11. Email notifications

Ship 1 through 7 as v1. Everything after that is additive.

## Design direction

Restrained and quiet. This is a tool artists open when they are stressed about a deadline, so it should not compete visually with their own work. Neutral background, one accent color, generous whitespace, real typographic hierarchy rather than boxes and borders everywhere. No stock illustration, no gradients, no celebratory confetti on submit.

Every screen should work at 375px wide. Deadline checking happens on a phone.

## Accessibility

WCAG AA minimum. Keyboard navigable throughout. Proper form labels and focus states. Do not rely on color alone to convey application status.

## Out of scope for v1

Payments, sales and invoicing, print inventory with editions and pricing, collector management, public portfolio pages, mobile native apps, team or gallery multi-user accounts.

---

# End goal: the organization side

The long-term target is two-sided. Organizations create accounts, post opportunities, and receive submissions directly through the platform. Artists apply without leaving the dashboard where their materials already live.

This is the monetization path. Artists resist paying for software; organizations already pay for submission management. Build the artist side free or near-free, charge organizations.

Build this only after the artist side has real usage. An empty platform is useless to an organization, and organizations with no artists on it are useless to artists. The artist-side tool has to stand alone and be worth using even if zero organizations ever join.

## Additional data model

**Organization**
- id, name, type (foundation / arts council / gallery / museum / university / nonprofit / residency)
- website, logoUrl, description, contactEmail, verifiedAt
- Verification is manual at first. A fake funder collecting artist materials and fees is the worst possible failure mode.

**OrgMember**
- id, organizationId, userId, role (admin / program manager / reviewer)
- Reviewers see only what they are assigned to.

**Program**
- id, organizationId, name, description, type, discipline
- opensAt, deadline, notifyDeadlineChanges
- eligibilityCriteria (structured list, each with a label and a required/optional flag)
- applicationFee, awardAmount, awardCount
- isPublished, isRecurring
- formSchema (JSON) — the fields this program asks for

**FormField** (inside formSchema)
- key, label, type (short text / long text / number / date / file / image set / url / select / checkbox)
- required, maxLength, maxFiles, acceptedFileTypes, helpText
- mapsTo (nullable) — the Asset or profile field this pulls from automatically

`mapsTo` is the feature that makes this better than existing submission platforms. If a program asks for a bio, the artist's current bio is already there. They edit it in context rather than hunting for the file.

**Submission**
- id, programId, applicantUserId, applicationId (links to the artist's own Application record)
- status (draft / submitted / under review / decided)
- responses (JSON keyed to formSchema), attachedAssetIds
- submittedAt, withdrawnAt

**Review**
- id, submissionId, reviewerId, scores (JSON keyed to a rubric), comments, recommendation
- isBlind (boolean)

**Decision**
- id, submissionId, outcome, reasonCode, feedbackToApplicant, sentAt

The Decision record writes straight back into the artist's Application, including the reason code. This is the whole system closing its loop: rejection reasons stop being lost in email and start being data the artist can learn from.

## Organization screens

**Program builder** — form builder with drag-to-reorder fields, eligibility criteria list, deadline and fee settings, preview as an applicant would see it.

**Submissions inbox** — table of submissions with filters by status, completeness, and reviewer assignment. Bulk actions for assigning reviewers and sending decisions.

**Review interface** — one submission at a time, rubric scoring in a side panel, optional blind mode that hides applicant name and identifying details.

**Decisions** — bulk decision sending with templated feedback. Require a reason code on every decline; make the feedback field prominent rather than optional.

**Program analytics** — applicant counts, discipline breakdown, completion rate for started-but-not-submitted applications.

## Applicant-side changes

- Browse published programs inside the app, filtered to the artist's disciplines
- One-click apply that prefills from mapped assets
- Draft autosave, since applications are written over weeks
- A submitted application creates the artist's own Application record automatically, no double entry
- Decisions arrive in-app, with the reason code already populated

## Non-negotiables for the organization side

- **Verification before publishing.** No unverified organization can collect fees or files.
- **Artists own their materials.** An organization sees only what was submitted to its own program, never the artist's wider library, other applications, or other outcomes.
- **Deletion works.** An artist can delete their account and data. Submitted materials retention is governed by a clear stated policy, not left ambiguous.
- **Fee transparency.** Application fees shown before an artist starts, never at the end.
- **Accessible forms.** Programs built here must be keyboard navigable and screen-reader usable regardless of how the organization configures them. Do not let a badly built form become inaccessible.

## Revised build order

Phases 1 through 11 above stay as they are. Then:

12. Organization accounts, members, and manual verification
13. Program builder and form schema
14. Public program browsing and one-click apply with asset mapping
15. Submissions inbox
16. Review interface and rubrics
17. Decisions, including write-back to the applicant's Application record
18. Program analytics
19. Application fee handling (payments)

---

# The differentiator: the shareable artist profile

Every artist gets a public profile at a clean URL, the way LinkedIn works. They attach it to any submission, paste it into an email, put it in an Instagram bio. A juror clicks once and sees who the artist is rather than opening a folder of loose PDFs.

This is the feature that separates the product from Submittable, and it is also the distribution engine. Artists share the link off-platform, which brings new artists in without paid acquisition.

## Data model

**Profile**
- id, workspaceId, slug (unique, user-chosen), isPublished
- displayName, pronouns (optional), headline, location, disciplines
- statement (short, distinct from the long artist statement)
- headshotUrl, websiteUrl, socialLinks (JSON)
- theme (a small set of preset layouts, no custom CSS)
- viewCount, lastViewedAt

**ProfileSection**
- id, profileId, type (featured_work / projects / exhibitions / awards / press / cv / contact)
- order, isVisible, config (JSON)
- Artists choose what appears and in what order. Do not force a fixed template.

**ProfileVisibility** (per field and per section)
- Each field carries one of: `public`, `jurors_only`, `blind_safe`, `hidden`
- `blind_safe` means it shows even during blind review. Work images, medium, project descriptions, and years active are blind safe. Name, headshot, location, pronouns, social links, and press are not.

## Three viewing modes

**1. Public view**
Anyone with the link. The artist's full presentation of themselves: featured work, project pages, CV highlights, contact. This is the version that gets shared.

**2. Juror view (identified)**
Reached from a submission. Adds context a juror actually wants: how long the practice has been active, exhibition and residency history pulled from CV entries, the full project the submission draws from rather than the five images that fit in the form. Never shows the artist's other applications, outcomes, rejections, or funding amounts.

**3. Juror view (blind)**
Only `blind_safe` fields. Work, medium, project description, practice duration. Identity revealed after the reviewer submits scores, or not at all if the program is fully blind. The program sets this, not the artist.

## Behaviors

- **Slug ownership.** First come, first served, reserved on signup. Changing it leaves a redirect from the old one so shared links do not break.
- **Draft and publish are separate.** Editing a live profile never shows half-finished changes to a juror mid-review.
- **Versioned snapshot at submission.** When an artist attaches their profile to a submission, store a snapshot. A juror reviewing three weeks later sees what was submitted, not whatever the artist has edited since. Show the live link too, clearly labeled.
- **View analytics for the artist.** Total views and views from juror links. No individual viewer identities, which would pressure artists into reading signals that are not there.
- **Projects are already structured.** The profile is largely generated from existing Project, Asset, and CVEntry records. Do not make artists maintain a second copy of their work.
- **Fast and light.** Server-rendered, images properly sized and lazy loaded. Jurors open dozens of these in a sitting on bad conference wifi.
- **Open Graph tags.** Shared links should preview well in Slack, email, and social.

## Non-negotiables

- Nothing about applications, outcomes, funding, or rejections is ever visible on any profile view. Artists must trust that this dashboard is private working space before they will use it honestly.
- Blind mode is enforced server-side. Never send suppressed fields to the client and hide them with CSS.
- Profiles are unpublished by default. Publishing is an explicit action.
- `noindex` until the artist opts into search engine visibility.

## Build placement

This moves ahead of most of the organization work. Build it as phase 12, before organization accounts. It is valuable on its own even with zero organizations on the platform, since artists can share the link with anyone. It also makes the artist-side product materially more worth using, which is what has to be true before approaching organizations at all.
