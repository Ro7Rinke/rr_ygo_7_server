/*
  Warnings:

  - You are about to alter the column `alias` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `attribute` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `category` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `level` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `ot` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `race` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `setcode` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `type` on the `datas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

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
    "status" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_boosters" ("cards_per_pack", "code", "created_at", "description", "id", "price", "status", "title") SELECT "cards_per_pack", "code", "created_at", "description", "id", "price", "status", "title" FROM "boosters";
DROP TABLE "boosters";
ALTER TABLE "new_boosters" RENAME TO "boosters";
CREATE UNIQUE INDEX "boosters_code_key" ON "boosters"("code");
CREATE TABLE "new_datas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ot" BIGINT,
    "alias" BIGINT,
    "setcode" BIGINT,
    "type" BIGINT,
    "atk" INTEGER,
    "def" INTEGER,
    "level" BIGINT,
    "race" BIGINT,
    "attribute" BIGINT,
    "category" BIGINT,
    CONSTRAINT "datas_id_fkey" FOREIGN KEY ("id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_datas" ("alias", "atk", "attribute", "category", "def", "id", "level", "ot", "race", "setcode", "type") SELECT "alias", "atk", "attribute", "category", "def", "id", "level", "ot", "race", "setcode", "type" FROM "datas";
DROP TABLE "datas";
ALTER TABLE "new_datas" RENAME TO "datas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
