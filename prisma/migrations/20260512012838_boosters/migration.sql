-- CreateTable
CREATE TABLE "rarities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "boosters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "cards_per_pack" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "booster_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booster_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "rarity_id" INTEGER NOT NULL,
    CONSTRAINT "booster_cards_booster_id_fkey" FOREIGN KEY ("booster_id") REFERENCES "boosters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booster_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booster_cards_rarity_id_fkey" FOREIGN KEY ("rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booster_slots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booster_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "min_rarity_id" INTEGER NOT NULL,
    "max_rarity_id" INTEGER NOT NULL,
    "unit_value" INTEGER,
    CONSTRAINT "booster_slots_booster_id_fkey" FOREIGN KEY ("booster_id") REFERENCES "boosters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booster_slots_min_rarity_id_fkey" FOREIGN KEY ("min_rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booster_slots_max_rarity_id_fkey" FOREIGN KEY ("max_rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booster_slot_rarity_chances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slot_id" INTEGER NOT NULL,
    "rarity_id" INTEGER NOT NULL,
    "chance" REAL NOT NULL,
    CONSTRAINT "booster_slot_rarity_chances_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "booster_slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booster_slot_rarity_chances_rarity_id_fkey" FOREIGN KEY ("rarity_id") REFERENCES "rarities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "rarities_code_key" ON "rarities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "boosters_code_key" ON "boosters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booster_cards_booster_id_card_id_key" ON "booster_cards"("booster_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "booster_slots_booster_id_position_key" ON "booster_slots"("booster_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "booster_slot_rarity_chances_slot_id_rarity_id_key" ON "booster_slot_rarity_chances"("slot_id", "rarity_id");
