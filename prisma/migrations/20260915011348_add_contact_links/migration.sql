-- CreateTable
CREATE TABLE "ContactOpportunity" (
    "contactId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,

    PRIMARY KEY ("contactId", "opportunityId"),
    CONSTRAINT "ContactOpportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactProject" (
    "contactId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    PRIMARY KEY ("contactId", "projectId"),
    CONSTRAINT "ContactProject_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
