/*
  Warnings:

  - Added the required column `original_name` to the `rarities` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rarities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL
);
INSERT INTO "new_rarities" ("code", "id", "level", "title") SELECT "code", "id", "level", "title" FROM "rarities";
DROP TABLE "rarities";
ALTER TABLE "new_rarities" RENAME TO "rarities";
CREATE UNIQUE INDEX "rarities_code_key" ON "rarities"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
