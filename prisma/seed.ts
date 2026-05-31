import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRarities() {
  const rarities = [
    { id: 1, title: "10000 Secret Rare", original_name: "10000secret", code: "10000SE", level: 800 },

    { id: 2, title: "25th Secret Rare", original_name: "25thsecret", code: "25thSE", level: 790 },
    { id: 3, title: "20th Secret Rare", original_name: "20thsecret", code: "20thSE", level: 780 },
    { id: 4, title: "Ghost Rare", original_name: "ghost", code: "GHR", level: 770 },
    { id: 5, title: "Starlight Rare", original_name: "starlight", code: "STR", level: 760 },
    { id: 6, title: "Ultimate Rare", original_name: "ultimate", code: "UTR", level: 750 },
    { id: 7, title: "Gold Ghost Rare", original_name: "goldghost", code: "GGR", level: 740 },
    { id: 8, title: "Collectors Rare", original_name: "collectors", code: "CR", level: 730 },
    { id: 9, title: "Pharaohs Rare", original_name: "pharaohs", code: "PRPH", level: 720 },

    { id: 10, title: "Millenium Secret Rare", original_name: "milleniumsecret", code: "MSR", level: 690 },
    { id: 11, title: "Extra Secret Rare", original_name: "extrasecret", code: "EXSE", level: 680 },
    { id: 12, title: "Platinum Secret Rare", original_name: "platinumsecret", code: "PLSE", level: 670 },
    { id: 13, title: "Gold Secret Rare", original_name: "goldsecret", code: "GSER", level: 660 },
    { id: 14, title: "Premium Gold Rare", original_name: "premiumgold", code: "PG", level: 650 },
    { id: 15, title: "Ultra Secret Rare", original_name: "ultrasecret", code: "ULSE", level: 640 },
    { id: 16, title: "Secret Rare", original_name: "secret", code: "SE", level: 630 },
    { id: 17, title: "Prismatic Secret Rare", original_name: "prismaticsecret", code: "PRM", level: 620 },
    { id: 18, title: "Extra Secret Parallel Rare", original_name: "extrasecretparallel", code: "EXSEP", level: 610 },
    { id: 19, title: "Duel Terminal Secret Parallel Rare", original_name: "dtscpr", code: "DTSCPR", level: 605 },
    { id: 20, title: "Secret Parallel Rare", original_name: "secretparallel", code: "SEP", level: 600 },

    { id: 21, title: "Platinum Rare", original_name: "platinum", code: "PLR", level: 590 },
    { id: 22, title: "Gold Rare", original_name: "gold", code: "GR", level: 580 },
    { id: 23, title: "Millenium Ultra Rare", original_name: "milleniumultra", code: "MUR", level: 560 },
    { id: 24, title: "Millenium Gold Rare", original_name: "milleniumgold", code: "MGR", level: 550 },
    { id: 25, title: "Millenium Rare", original_name: "millenium", code: "MR", level: 540 },
    { id: 26, title: "Ultra Rare", original_name: "ultra", code: "UR", level: 530 },
    { id: 27, title: "Duel Terminal Ultra Parallel Rare", original_name: "dtupr", code: "DTUPR", level: 515 },
    { id: 28, title: "Ultra Parallel Rare", original_name: "ultraparallel", code: "URP", level: 510 },
    { id: 29, title: "Ultra Rare K.C.", original_name: "kcultra", code: "KCUR", level: 500 },

    { id: 30, title: "Super Rare", original_name: "super", code: "SR", level: 450 },
    { id: 31, title: "Duel Terminal Super Parallel Rare", original_name: "dtspr", code: "DTSPR", level: 445 },
    { id: 32, title: "Super Parallel Rare", original_name: "superparallel", code: "SRP", level: 440 },

    { id: 33, title: "Rare K.C.", original_name: "kcrare", code: "KCR", level: 360 },
    { id: 34, title: "Rare", original_name: "rare", code: "R", level: 350 },
    { id: 35, title: "Rare Red", original_name: "rare-red", code: "R-R", level: 345 },
    { id: 36, title: "Rare Blue", original_name: "rare-blue", code: "R-B", level: 344 },
    { id: 37, title: "Rare Purple", original_name: "rare-purple", code: "R-P", level: 343 },
    { id: 38, title: "Rare Green", original_name: "rare-green", code: "R-G", level: 342 },
    { id: 39, title: "Rare Copper", original_name: "rare-copper", code: "R-C", level: 341 },
    { id: 40, title: "Rare Wedgewood", original_name: "rare-wedgewood", code: "R-W", level: 340 },
    { id: 41, title: "Duel Terminal Parallel Rare", original_name: "dtrpr", code: "DTRPR", level: 335 },
    { id: 42, title: "Rare Parallel", original_name: "rareparallel", code: "RP", level: 330 },
    { id: 43, title: "Mosaic", original_name: "mosaic", code: "MOS", level: 322 },
    { id: 44, title: "Shatterfoil", original_name: "shatterfoil", code: "SHF", level: 321 },
    { id: 45, title: "Starfoil", original_name: "starfoil", code: "SF", level: 320 },

    { id: 46, title: "Duel Terminal Short Print", original_name: "dtpsp", code: "DTPSP", level: 235 },
    { id: 47, title: "Short Print", original_name: "shortprint", code: "SP", level: 230 },

    { id: 48, title: "Common K.C.", original_name: "kccommon", code: "KCC", level: 130 },
    { id: 49, title: "Duel Terminal Common Parallel", original_name: "dtpc", code: "DTPC", level: 125 },
    { id: 50, title: "Common Parallel", original_name: "commonparallel", code: "CMP", level: 120 },
    { id: 51, title: "Common", original_name: "common", code: "C", level: 110 },

    { id: 52, title: "Unknow", original_name: "unknow", code: "UK", level: 0 }
  ];

  for (const rarity of rarities) {
    await prisma.rarity.upsert({
      where: { id: rarity.id },
      update: {
        code: rarity.code,
        title: rarity.title,
        original_name: rarity.original_name,
        level: rarity.level
      },
      create: rarity,
    });
  }

  console.log('✅ Rarities seeded');
}

async function main() {
  console.log('🌱 Starting seed...');

  await seedRarities();

  console.log('🌱 Seed finished');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });