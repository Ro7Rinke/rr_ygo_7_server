-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sealed_deck_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sealed_deck_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "rarity_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "sealed_deck_cards_sealed_deck_id_fkey" FOREIGN KEY ("sealed_deck_id") REFERENCES "sealed_decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sealed_deck_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sealed_deck_cards_rarity_id_fkey" FOREIGN KEY ("rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sealed_deck_cards" ("card_id", "id", "rarity_id", "sealed_deck_id") SELECT "card_id", "id", "rarity_id", "sealed_deck_id" FROM "sealed_deck_cards";
DROP TABLE "sealed_deck_cards";
ALTER TABLE "new_sealed_deck_cards" RENAME TO "sealed_deck_cards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
