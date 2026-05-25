/*
  Warnings:

  - A unique constraint covering the columns `[user_id,duel_id]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ReplayHash" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReplayHash_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReplayHash_hash_idx" ON "ReplayHash"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "ReplayHash_user_id_hash_key" ON "ReplayHash"("user_id", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "Game_user_id_duel_id_key" ON "Game"("user_id", "duel_id");
