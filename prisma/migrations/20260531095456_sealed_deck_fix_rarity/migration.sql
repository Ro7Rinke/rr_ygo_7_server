-- CreateTable
CREATE TABLE "sealed_decks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "money_type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "total_cards" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "sale_status" INTEGER NOT NULL DEFAULT 0,
    "is_initial" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sealed_deck_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sealed_deck_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "rarity_id" INTEGER NOT NULL,
    CONSTRAINT "sealed_deck_cards_sealed_deck_id_fkey" FOREIGN KEY ("sealed_deck_id") REFERENCES "sealed_decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sealed_deck_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sealed_deck_cards_rarity_id_fkey" FOREIGN KEY ("rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sealed_decks_code_key" ON "sealed_decks"("code");
