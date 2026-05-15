import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRarities() {
  const rarities = [
    { id: 10, code: 'C', title: 'Common' },
    { id: 20, code: 'R', title: 'Rare' },
    { id: 30, code: 'SR', title: 'Super Rare' },
    { id: 40, code: 'UR', title: 'Ultra Rare' },
    { id: 50, code: 'SC', title: 'Secret Rare' },
  ];

  for (const rarity of rarities) {
    await prisma.rarity.upsert({
      where: { id: rarity.id },
      update: {
        code: rarity.code,
        title: rarity.title,
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