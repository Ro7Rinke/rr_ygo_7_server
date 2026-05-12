-- CreateTable
CREATE TABLE "cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "status" INTEGER NOT NULL DEFAULT 0,
    "introduced_by" TEXT,
    "released_by" TEXT
);

-- CreateTable
CREATE TABLE "datas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ot" INTEGER,
    "alias" INTEGER,
    "setcode" INTEGER,
    "type" INTEGER,
    "atk" INTEGER,
    "def" INTEGER,
    "level" INTEGER,
    "race" INTEGER,
    "attribute" INTEGER,
    "category" INTEGER,
    CONSTRAINT "datas_id_fkey" FOREIGN KEY ("id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "texts" (
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
    CONSTRAINT "texts_id_fkey" FOREIGN KEY ("id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
