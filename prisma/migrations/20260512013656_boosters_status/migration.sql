/*
  Warnings:

  - Added the required column `status` to the `boosters` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_boosters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "cards_per_pack" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_boosters" ("cards_per_pack", "code", "created_at", "description", "id", "price", "title") SELECT "cards_per_pack", "code", "created_at", "description", "id", "price", "title" FROM "boosters";
DROP TABLE "boosters";
ALTER TABLE "new_boosters" RENAME TO "boosters";
CREATE UNIQUE INDEX "boosters_code_key" ON "boosters"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
