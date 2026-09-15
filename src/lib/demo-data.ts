import { prisma } from "@/lib/prisma";

// Fills an empty workspace with a realistic example practice (projects,
// opportunities, applications at each stage, CV entries, contacts) so a new
// sign-in has something to look at instead of an all-zero dashboard.
export async function seedDemoData(workspaceId: string) {
  const [threads, coastline] = await Promise.all([
    prisma.project.create({
      data: {
        workspaceId,
        title: "Threads We Carry",
        workingTitle: "Migration Textiles",
        status: "active",
        description:
          "A mixed-media series pairing archival family photographs with woven textile fragments, exploring migration and inherited memory.",
        startDate: new Date("2025-11-01"),
        medium: "Photography, textile",
        themes: JSON.stringify(["migration", "memory", "family archive"]),
        isOngoing: false,
      },
    }),
    prisma.project.create({
      data: {
        workspaceId,
        title: "Coastline Studies",
        status: "ongoing",
        description: "An open-ended body of landscape work returned to every spring on the Gulf coast.",
        startDate: new Date("2023-04-01"),
        medium: "Photography",
        themes: JSON.stringify(["landscape", "erosion", "seasonality"]),
        isOngoing: true,
      },
    }),
  ]);

  await prisma.participant.createMany({
    data: [
      {
        projectId: threads.id,
        name: "Amara Diallo",
        role: "Textile collaborator",
        contactEmail: "amara@example.com",
        consentStatus: "granted",
      },
      {
        projectId: threads.id,
        name: "Jordan's grandmother (archival subject)",
        role: "Subject, archival photographs",
        consentStatus: "granted",
        notes: "Family consented to public exhibition use in writing, 2025-10.",
      },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      { projectId: threads.id, title: "Print run for gallery submission", dueDate: new Date("2026-10-05"), status: "planned" },
      { projectId: threads.id, title: "Studio visit with curator", dueDate: new Date("2026-09-22"), status: "planned" },
      {
        projectId: coastline.id,
        title: "Spring shoot week",
        dueDate: new Date("2027-04-10"),
        status: "planned",
        notes: "Annual -- tide charts booked in February.",
      },
    ],
  });

  const [statement, cv, sample1, sample2] = await Promise.all([
    prisma.asset.create({
      data: {
        workspaceId,
        type: "artist_statement",
        title: "Artist statement",
        version: "2026-v3",
        notes: "Rewritten for the fellowship cycle -- leads with the textile collaboration.",
      },
    }),
    prisma.asset.create({ data: { workspaceId, type: "cv", title: "CV", version: "2026-09" } }),
    prisma.asset.create({
      data: {
        workspaceId,
        type: "work_sample",
        title: "Threads We Carry -- sample 01",
        projectId: threads.id,
        fileUrl: "https://example.com/samples/threads-01.jpg",
      },
    }),
    prisma.asset.create({
      data: {
        workspaceId,
        type: "work_sample",
        title: "Threads We Carry -- sample 02",
        projectId: threads.id,
        fileUrl: "https://example.com/samples/threads-02.jpg",
      },
    }),
  ]);

  const [fellowship, residency, pastGrant] = await Promise.all([
    prisma.opportunity.create({
      data: {
        workspaceId,
        name: "Midwest Photography Fellowship",
        organization: "Midwest Arts Council",
        type: "fellowship",
        url: "https://example.com/midwest-fellowship",
        deadline: new Date("2026-10-15"),
        notifyAt: new Date("2026-10-01"),
        awardAmount: 12000,
        discipline: "photography",
        eligibilityNotes: "2+ years documented public practice in the region; work samples must be unpublished.",
        isRecurring: true,
        recurrenceCadence: "annual",
      },
    }),
    prisma.opportunity.create({
      data: {
        workspaceId,
        name: "Harbor Light Residency",
        organization: "Harbor Light Arts Center",
        type: "residency",
        deadline: new Date("2026-11-30"),
        feeAmount: 25,
        discipline: "visual art",
        eligibilityNotes: "Open to all disciplines; must commit to a 6-week on-site residency.",
        isRecurring: true,
        recurrenceCadence: "annual",
      },
    }),
    prisma.opportunity.create({
      data: {
        workspaceId,
        name: "Statewide Documentary Grant",
        organization: "State Arts Board",
        type: "grant",
        deadline: new Date("2026-03-01"),
        awardAmount: 8000,
        discipline: "photography",
        isRecurring: true,
        recurrenceCadence: "annual",
      },
    }),
  ]);

  await prisma.application.create({
    data: {
      opportunityId: fellowship.id,
      workspaceId,
      status: "drafting",
      projects: { create: [{ projectId: threads.id }] },
      assetsUsed: { create: [{ assetId: statement.id }, { assetId: sample1.id }, { assetId: sample2.id }] },
    },
  });

  await prisma.application.create({
    data: {
      opportunityId: residency.id,
      workspaceId,
      status: "under_review",
      submittedAt: new Date("2026-08-20"),
      projects: { create: [{ projectId: coastline.id }] },
      assetsUsed: { create: [{ assetId: cv.id }] },
    },
  });

  await prisma.application.create({
    data: {
      opportunityId: pastGrant.id,
      workspaceId,
      status: "decision",
      submittedAt: new Date("2026-02-15"),
      decisionAt: new Date("2026-04-01"),
      outcome: "declined",
      outcomeReasonCode: "competitive_pool",
      outcomeReason: "Panel cited a strong, oversubscribed pool this cycle -- encouraged to reapply.",
      feedbackReceived: "\"Strong technical work; the project narrative could be sharper about audience.\"",
      canReapply: true,
      reapplyDate: new Date("2027-01-01"),
      retro: "Lead with the project's audience/impact angle earlier in the narrative next time.",
      projects: { create: [{ projectId: threads.id }] },
    },
  });

  await prisma.cVEntry.createMany({
    data: [
      {
        workspaceId,
        category: "exhibition",
        title: "Group show: New Documentary Voices",
        organization: "Riverside Gallery",
        location: "Minneapolis, MN",
        date: new Date("2025-06-01"),
        isPublic: true,
      },
      {
        workspaceId,
        category: "publication",
        title: "Featured artist profile",
        organization: "Midwest Photo Journal",
        date: new Date("2025-09-01"),
        isPublic: true,
      },
    ],
  });

  await prisma.contact.createMany({
    data: [
      {
        workspaceId,
        name: "Priya Nathan",
        organization: "Midwest Arts Council",
        role: "Program Officer",
        email: "priya@example.com",
        relationshipType: "funder",
        lastContactedAt: new Date("2026-08-01"),
      },
      {
        workspaceId,
        name: "Marcus Webb",
        organization: "Riverside Gallery",
        role: "Curator",
        email: "marcus@example.com",
        relationshipType: "curator",
      },
    ],
  });
}
