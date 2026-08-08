-- CreateTable
CREATE TABLE "user_deck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "user_deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_deck_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_deck_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "user_deck_cards_user_deck_id_fkey" FOREIGN KEY ("user_deck_id") REFERENCES "user_deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_deck_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plflist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "plflist_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plflist_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "status_title" TEXT NOT NULL,
    CONSTRAINT "plflist_cards_plflist_id_fkey" FOREIGN KEY ("plflist_id") REFERENCES "plflist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plflist_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_deck_cards_user_deck_id_card_id_key" ON "user_deck_cards"("user_deck_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "plflist_title_key" ON "plflist"("title");

-- CreateIndex
CREATE UNIQUE INDEX "plflist_cards_plflist_id_card_id_key" ON "plflist_cards"("plflist_id", "card_id");
