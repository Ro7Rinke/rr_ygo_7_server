/*
  Warnings:

  - Added the required column `slot` to the `user_deck_cards` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_deck_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_deck_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "slot" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "user_deck_cards_user_deck_id_fkey" FOREIGN KEY ("user_deck_id") REFERENCES "user_deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_deck_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_deck_cards" ("amount", "card_id", "created_at", "id", "updated_at", "user_deck_id") SELECT "amount", "card_id", "created_at", "id", "updated_at", "user_deck_id" FROM "user_deck_cards";
DROP TABLE "user_deck_cards";
ALTER TABLE "new_user_deck_cards" RENAME TO "user_deck_cards";
CREATE UNIQUE INDEX "user_deck_cards_user_deck_id_card_id_key" ON "user_deck_cards"("user_deck_id", "card_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
