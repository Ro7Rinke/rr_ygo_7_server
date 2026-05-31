-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "is_admin" INTEGER NOT NULL DEFAULT 0,
    "rp" INTEGER NOT NULL DEFAULT 0,
    "cash" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "loses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "status" INTEGER NOT NULL DEFAULT 0,
    "in_game" INTEGER NOT NULL DEFAULT 0,
    "introduced_by" TEXT,
    "released_by" TEXT,
    "hash" TEXT
);

-- CreateTable
CREATE TABLE "card_datas" (
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
    CONSTRAINT "card_datas_id_fkey" FOREIGN KEY ("id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "card_texts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "desc" TEXT,
    "str1" TEXT,
    "str2" TEXT,
    "str3" TEXT,
    "str4" TEXT,
    "str5" TEXT,
    "str6" TEXT,
    "str7" TEXT,
    "str8" TEXT,
    "str9" TEXT,
    "str10" TEXT,
    "str11" TEXT,
    "str12" TEXT,
    "str13" TEXT,
    "str14" TEXT,
    "str15" TEXT,
    "str16" TEXT,
    CONSTRAINT "card_texts_id_fkey" FOREIGN KEY ("id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rarities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "boosters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "money_type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "cards_per_pack" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
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
    "unit_value" INTEGER,
    CONSTRAINT "booster_slots_booster_id_fkey" FOREIGN KEY ("booster_id") REFERENCES "boosters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booster_slot_groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slot_id" INTEGER NOT NULL,
    "min_rarity_level" INTEGER NOT NULL,
    "max_rarity_level" INTEGER NOT NULL,
    "chance" REAL NOT NULL,
    CONSTRAINT "booster_slot_groups_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "booster_slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "duel_id" TEXT,
    "type" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "result_status" INTEGER NOT NULL DEFAULT 0,
    "has_replay" INTEGER NOT NULL DEFAULT 0,
    "duel_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "game_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "game_player_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_player_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "replay_hash" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "replay_hash_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_nickname_key" ON "user"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "rarities_code_key" ON "rarities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "boosters_code_key" ON "boosters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booster_cards_booster_id_card_id_key" ON "booster_cards"("booster_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "booster_slots_booster_id_position_key" ON "booster_slots"("booster_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "user_cards_user_id_card_id_key" ON "user_cards"("user_id", "card_id");

-- CreateIndex
CREATE INDEX "game_user_id_idx" ON "game"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_user_id_duel_id_key" ON "game"("user_id", "duel_id");

-- CreateIndex
CREATE INDEX "game_player_game_id_idx" ON "game_player"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_player_game_id_user_id_key" ON "game_player"("game_id", "user_id");

-- CreateIndex
CREATE INDEX "replay_hash_hash_idx" ON "replay_hash"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "replay_hash_user_id_hash_key" ON "replay_hash"("user_id", "hash");
