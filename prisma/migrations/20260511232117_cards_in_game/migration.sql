-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "status" INTEGER NOT NULL DEFAULT 0,
    "in_game" INTEGER NOT NULL DEFAULT 0,
    "introduced_by" TEXT,
    "released_by" TEXT
);
INSERT INTO "new_cards" ("created_at", "id", "introduced_by", "released_by", "status", "updated_at") SELECT "created_at", "id", "introduced_by", "released_by", "status", "updated_at" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
