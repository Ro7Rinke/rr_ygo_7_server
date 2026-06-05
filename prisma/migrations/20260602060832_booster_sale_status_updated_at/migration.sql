-- AlterTable
ALTER TABLE "sealed_decks" ADD COLUMN "updated_at" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_boosters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "money_type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "cards_per_pack" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "sale_status" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_boosters" ("cards_per_pack", "code", "created_at", "description", "id", "money_type", "prefix", "price", "status", "title") SELECT "cards_per_pack", "code", "created_at", "description", "id", "money_type", "prefix", "price", "status", "title" FROM "boosters";
DROP TABLE "boosters";
ALTER TABLE "new_boosters" RENAME TO "boosters";
CREATE UNIQUE INDEX "boosters_code_key" ON "boosters"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
