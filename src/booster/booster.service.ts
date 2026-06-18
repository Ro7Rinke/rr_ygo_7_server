import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBoosterDto } from './dto/create-booster.dto';
import { CreateSealedDeckDto } from './dto/create-sealed-deck.dto';

@Injectable()
export class BoosterService {
    constructor(private prisma: PrismaService) { }

    async createBooster(data: CreateBoosterDto, user: any) {
        if (!user || user.is_admin !== 1) {
            throw new BadRequestException('Not allowed');
        }

        return this.prisma.$transaction(async (tx) => {
            const booster = await tx.booster.create({
                data: {
                    title: data.title,
                    description: data.description,
                    code: data.code,
                    prefix: data.prefix,
                    money_type: data.money_type,
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
                const total = slot.groups.reduce((acc, g) => acc + g.chance, 0);

                if (Math.round(total) !== 100) {
                    throw new BadRequestException(
                        `Slot ${slot.position} groups must sum 100`,
                    );
                }

                const createdSlot = await tx.boosterSlot.create({
                    data: {
                        booster_id: booster.id,
                        position: slot.position,
                        unit_value: slot.unit_value ?? 0,
                    },
                });

                await tx.boosterSlotGroup.createMany({
                    data: slot.groups.map((g) => ({
                        slot_id: createdSlot.id,
                        min_rarity_level: g.min_rarity_level,
                        max_rarity_level: g.max_rarity_level,
                        chance: g.chance,
                    })),
                });
            }

            return booster;
        });
    }

    async buyBooster(userId: number, boosterId: number) {
        return this.prisma.$transaction(async (tx) => {
            const booster = await tx.booster.findUnique({
                where: { id: boosterId },
                include: {
                    slots: {
                        include: {
                            groups: true,
                        },
                    },
                },
            });

            if (!booster) throw new BadRequestException('Booster not found');

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) throw new Error('User not found');

            const moneyField = booster.money_type === 'cash' ? 'cash' : 'tickets';
            if (user[moneyField] < booster.price) {
                throw new BadRequestException(`Not enough ${booster.money_type}`);
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    [moneyField]: { decrement: booster.price },
                },
            });

            const boosterCardsPool = await tx.boosterCard.findMany({
                where: {
                    booster_id: boosterId,
                    card: { in_game: 1 },
                },
                include: {
                    rarity: true,
                },
            });

            const userCardsInventory = await tx.userCard.findMany({
                where: { user_id: userId },
            });
            const inventoryMap = new Map(userCardsInventory.map((uc) => [uc.card_id, uc.amount]));

            const usedCardsInPack = new Set<number>();
            const results: any[] = [];

            const sortedSlots = booster.slots.sort((a, b) => a.position - b.position);

            for (const slot of sortedSlots) {
                const validGroups = slot.groups
                    .map((group) => {
                        const availableCards = boosterCardsPool.filter((bc) => {
                            const isWithinRarityRange =
                                bc.rarity.level >= group.min_rarity_level &&
                                bc.rarity.level <= group.max_rarity_level;

                            const isAlreadyPickedInPack = usedCardsInPack.has(bc.card_id);

                            return isWithinRarityRange && !isAlreadyPickedInPack;
                        });

                        return {
                            ...group,
                            availableCards,
                        };
                    })
                    .filter((group) => group.availableCards.length > 0);

                if (!validGroups.length) {
                    results.push({
                        slot: slot.position,
                        refunded: slot.unit_value ?? 0,
                    });
                    continue;
                }

                const pickedGroup = this.pickGroup(validGroups);
                if (!pickedGroup) {
                    results.push({
                        slot: slot.position,
                        refunded: slot.unit_value ?? 0,
                    });
                    continue;
                }

                const finalCardsPool = pickedGroup.availableCards;
                const pickedBoosterCard = finalCardsPool[Math.floor(Math.random() * finalCardsPool.length)];

                usedCardsInPack.add(pickedBoosterCard.card_id);

                const currentOwnedAmount = (inventoryMap.get(pickedBoosterCard.card_id) as number) || 0;

                if (currentOwnedAmount >= 9) {
                    results.push({
                        slot: slot.position,
                        card_id: pickedBoosterCard.card_id,
                        rarity_id: pickedBoosterCard.rarity_id,
                        rarity_code: pickedBoosterCard.rarity.code,
                        refunded: slot.unit_value ?? 0,
                        discardedByLimit: true 
                    });
                    continue;
                }

                inventoryMap.set(pickedBoosterCard.card_id, currentOwnedAmount + 1);

                await tx.userCard.upsert({
                    where: {
                        user_id_card_id: {
                            user_id: userId,
                            card_id: pickedBoosterCard.card_id,
                        },
                    },
                    create: {
                        user_id: userId,
                        card_id: pickedBoosterCard.card_id,
                        amount: 1,
                    },
                    update: {
                        amount: { increment: 1 },
                    },
                });

                results.push({
                    slot: slot.position,
                    card_id: pickedBoosterCard.card_id,
                    rarity_id: pickedBoosterCard.rarity_id,
                    rarity_code: pickedBoosterCard.rarity.code,
                });
            }

            const totalRefunded = results
                .filter((r) => r.refunded)
                .reduce((acc, r) => acc + r.refunded, 0);

            if (totalRefunded > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        [moneyField]: { increment: totalRefunded },
                    },
                });
            }

            return {
                booster: booster.title,
                results,
            };
        });
    }

    private pickGroup(groups: any[]) {
        if (!groups.length) return null;

        const totalChance = groups.reduce((acc, g) => acc + g.chance, 0);
        const roll = Math.random() * totalChance;
        let acc = 0;

        for (const g of groups) {
            acc += g.chance;
            if (roll <= acc) return g;
        }

        return groups[groups.length - 1];
    }

    async findBoosters() {
        return this.prisma.booster.findMany({
            where: { status: 1 },
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                prefix: true,
                price: true,
                cards_per_pack: true,
                money_type: true,
                status: true
            },
        });
    }

    async findAllBoosters() {
        return this.prisma.booster.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                prefix: true,
                price: true,
                cards_per_pack: true,
                money_type: true,
                status: true
            },
        });
    }

    async findSealedDecks() {
        return this.prisma.sealedDeck.findMany({
            where: { status: 1 },
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                prefix: true,
                total_cards: true,
                price: true,
                money_type: true,
                is_initial: true,
                sale_status: true,
                status: true
            }
        })
    }

    async findAllSealedDecks() {
        return this.prisma.sealedDeck.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                code: true,
                prefix: true,
                total_cards: true,
                price: true,
                money_type: true,
                is_initial: true,
                sale_status: true,
                status: true
            }
        })
    }

    async createSealedDeck(data: CreateSealedDeckDto, user: any) {
        if (!user || user.is_admin !== 1) {
            throw new BadRequestException('Not allowed');
        }

        return this.prisma.$transaction(async (tx) => {

            const sealedDeck = await tx.sealedDeck.create({
                data: {
                    title: data.title,
                    description: data.description || "",
                    code: data.code,
                    prefix: data.prefix,
                    money_type: data.money_type,
                    price: data.price,
                    total_cards: data.total_cards,
                    status: 2,
                    sale_status: 0,
                    is_initial: data.is_initial ?? 0,
                },
            });

            if (data.cards && data.cards.length > 0) {
                await tx.sealedDeckCard.createMany({
                    data: data.cards.map((c) => ({
                        sealed_deck_id: sealedDeck.id,
                        card_id: c.card_id,
                        rarity_id: c.rarity_id,
                        amount: c.amount ?? 1,
                    })),
                });
            }

            return sealedDeck;
        });
    }

    async activateBooster(boosterId: number, user: any) {
        if (!user || user.is_admin !== 1) {
            throw new BadRequestException('Not allowed');
        }

        return this.prisma.$transaction(async (tx) => {
            const booster = await tx.booster.findUnique({
                where: { id: boosterId },
                select: { code: true, id: true }
            });

            if (!booster) {
                throw new BadRequestException('Booster not found');
            }

            const updatedBooster = await tx.booster.update({
                where: { id: boosterId },
                data: {
                    status: 1,
                    sale_status: 1
                },
            });

            const boosterCards = await tx.boosterCard.findMany({
                where: { booster_id: boosterId },
                select: { card_id: true }
            });

            const cardIds = boosterCards.map(bc => bc.card_id);

            if (cardIds.length > 0) {
                await tx.cards.updateMany({
                    where: {
                        id: { in: cardIds },
                        released_by: null
                    },
                    data: {
                        released_by: booster.code
                    }
                });
            }

            return updatedBooster;
        });
    }

    async activateSealedDeck(sealedDeckId: number, user: any) {
        if (!user || user.is_admin !== 1) {
            throw new BadRequestException('Not allowed');
        }

        return this.prisma.$transaction(async (tx) => {
            const sealedDeck = await tx.sealedDeck.findUnique({
                where: { id: sealedDeckId },
                select: { code: true, id: true }
            });

            if (!sealedDeck) {
                throw new BadRequestException('Sealed Deck not found');
            }

            const updatedDeck = await tx.sealedDeck.update({
                where: { id: sealedDeckId },
                data: {
                    status: 1,
                    sale_status: 1
                },
            });

            const sealedDeckCards = await tx.sealedDeckCard.findMany({
                where: { sealed_deck_id: sealedDeckId },
                select: { card_id: true }
            });

            const cardIds = Array.from(new Set(sealedDeckCards.map(sdc => sdc.card_id)));

            if (cardIds.length > 0) {
                await tx.cards.updateMany({
                    where: {
                        id: { in: cardIds },
                        released_by: null
                    },
                    data: {
                        released_by: sealedDeck.code
                    }
                });
            }

            return updatedDeck;
        });
    }

    async buySealedDeck(userId: number, sealedDeckId: number) {
        return this.prisma.$transaction(async (tx) => {
            const sealedDeck = await tx.sealedDeck.findUnique({
                where: { id: sealedDeckId },
                include: {
                    cards: {
                        include: {
                            card: true,
                            rarity: true
                        }
                    }
                }
            });

            if (!sealedDeck || sealedDeck.status !== 1) {
                throw new BadRequestException('Sealed Deck not found or not available for purchase');
            }

            if (!sealedDeck.cards || sealedDeck.cards.length === 0) {
                throw new BadRequestException('This deck has no cards registered');
            }

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) throw new BadRequestException('User not found');

            const moneyTypeLower = sealedDeck.money_type.toLowerCase();

            const MOVEMENT_FIELDS_MAP: Record<string, string> = {
                cash: 'cash',
                ticket: 'tickets',
                tickets: 'tickets',
                gold_ticket: 'gold_tickets',
                gold_tickets: 'gold_tickets',
            };
            const moneyField = MOVEMENT_FIELDS_MAP[moneyTypeLower];

            if (!moneyField) {
                throw new BadRequestException(`Unknown money type: ${sealedDeck.money_type}`);
            }

            if (user[moneyField] < sealedDeck.price) {
                throw new BadRequestException(`Not enough ${sealedDeck.money_type}`);
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    [moneyField]: { decrement: sealedDeck.price },
                },
            });

            const results: any[] = [];

            for (const deckCard of sealedDeck.cards) {
                const copiesToAdd = deckCard.amount ?? 1;

                await tx.userCard.upsert({
                    where: {
                        user_id_card_id: {
                            user_id: userId,
                            card_id: deckCard.card_id,
                        },
                    },
                    create: {
                        user_id: userId,
                        card_id: deckCard.card_id,
                        amount: copiesToAdd,
                    },
                    update: {
                        amount: { increment: copiesToAdd },
                    },
                });

                results.push({
                    card_id: deckCard.card_id,
                    amount: copiesToAdd,
                    rarity_id: deckCard.rarity_id,
                    rarity_code: deckCard.rarity.code
                });
            }

            return {
                id: sealedDeck.id,
                title: sealedDeck.title,
                code: sealedDeck.code,
                price: sealedDeck.price,
                money_type: sealedDeck.money_type,
                cards: results,
            };
        });
    }

}