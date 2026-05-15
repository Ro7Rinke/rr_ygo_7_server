import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBoosterDto } from './dto/create-booster.dto';

@Injectable()
export class BoosterService {
    constructor(private prisma: PrismaService) { }

    async createBooster(data: CreateBoosterDto, user: any) {
        if (!user || user.is_admin !== 1) {
            throw new BadRequestException('Not allowed');
        }

        for (const slot of data.slots) {
            const total = slot.chances.reduce((acc, c) => acc + c.chance, 0);

            if (Math.round(total) !== 100) {
                throw new BadRequestException(
                    `Slot ${slot.position} chances must sum 100`,
                );
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const booster = await tx.booster.create({
                data: {
                    title: data.title,
                    description: data.description,
                    code: data.code,
                    price: data.price,
                    status: 2,
                    cards_per_pack: data.slots.length,
                },
            });

            await tx.boosterCard.createMany({
                data: data.cards.map((c) => ({
                    booster_id: booster.id,
                    card_id: c.card_id,
                    rarity_id: c.rarity_id,
                })),
            });

            for (const slot of data.slots) {
                const createdSlot = await tx.boosterSlot.create({
                    data: {
                        booster_id: booster.id,
                        position: slot.position,
                        min_rarity_id: slot.min_rarity_id,
                        max_rarity_id: slot.max_rarity_id,
                        unit_value: slot.unit_value ?? 0,
                    },
                });

                await tx.boosterSlotRarityChance.createMany({
                    data: slot.chances.map((c) => ({
                        slot_id: createdSlot.id,
                        rarity_id: c.rarity_id,
                        chance: c.chance,
                    })),
                });
            }

            return booster;
        });
    }

    async buyBooster(userId: number, boosterId: number) {
        const booster = await this.prisma.booster.findUnique({
            where: { id: boosterId },
            include: {
                slots: {
                    include: { chances: true },
                },
            },
        });

        if (!booster) throw new BadRequestException('Booster not found');

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.cash < booster.price) {
            throw new BadRequestException('Not enough cash');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                cash: user.cash - booster.price,
            },
        });

        const usedCards = new Set<number>();

        const results: any[] = [];

        for (const slot of booster.slots.sort((a, b) => a.position - b.position)) {
            const rarity = await this.pickRarity(slot);

            const pool = await this.prisma.boosterCard.findMany({
                where: {
                    booster_id: boosterId,
                    rarity_id: rarity.id,
                    card: {
                        in_game: 1,
                    },
                    card_id: {
                        notIn: Array.from(usedCards),
                    },
                },
                include: {
                    card: true,
                },
            });

            const filtered: typeof pool = [];

            for (const item of pool) {
                const ownedCount = await this.prisma.userCard.findUnique({
                    where: {
                        user_id_card_id: {
                            user_id: userId,
                            card_id: item.card_id,
                        },
                    },
                });

                if (!ownedCount || ownedCount.amount < 9) {
                    filtered.push(item);
                }
            }

            if (filtered.length === 0) {
                results.push({
                    slot: slot.position,
                    refunded: slot.unit_value ?? 0,
                });
                continue;
            }

            const pick = filtered[Math.floor(Math.random() * filtered.length)];

            usedCards.add(pick.card_id);

            await this.prisma.userCard.upsert({
                where: {
                    user_id_card_id: {
                        user_id: userId,
                        card_id: pick.card_id,
                    },
                },
                create: {
                    user_id: userId,
                    card_id: pick.card_id,
                    amount: 1,
                },
                update: {
                    amount: {
                        increment: 1,
                    },
                },
            });

            results.push({
                slot: slot.position,
                card_id: pick.card_id,
                rarity_id: rarity.id,
            });
        }

        const refunded = results
            .filter((r) => r.refunded)
            .reduce((acc, r) => acc + r.refunded, 0);

        if (refunded > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    cash: {
                        increment: refunded,
                    },
                },
            });
        }

        return {
            booster: booster.title,
            results,
        };
    }

    private async pickRarity(slot: any) {
        const chances = await this.prisma.boosterSlotRarityChance.findMany({
            where: { slot_id: slot.id },
            include: { rarity: true },
        });

        const roll = Math.random() * 100;
        let acc = 0;

        for (const c of chances) {
            acc += c.chance;
            if (roll <= acc) return c.rarity;
        }

        return chances[chances.length - 1].rarity;
    }

    async findAll() {
        return this.prisma.booster.findMany({
            where: {
                status: 1,
            },
            select: {
                id: true,
                title: true,
                code: true,
                price: true,
                cards_per_pack: true,
            },
        });
    }
}