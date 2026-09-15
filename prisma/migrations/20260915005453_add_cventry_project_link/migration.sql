-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CVEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "location" TEXT,
    "date" DATETIME,
    "description" TEXT,
    "sourceApplicationId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CVEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CVEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CVEntry" ("category", "createdAt", "date", "description", "id", "isPublic", "location", "organization", "sourceApplicationId", "title", "workspaceId") SELECT "category", "createdAt", "date", "description", "id", "isPublic", "location", "organization", "sourceApplicationId", "title", "workspaceId" FROM "CVEntry";
DROP TABLE "CVEntry";
ALTER TABLE "new_CVEntry" RENAME TO "CVEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
