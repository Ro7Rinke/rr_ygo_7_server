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

            const moneyField = booster.money_type === 'cash' ? 'cash' : 'ticket';
            if (user[moneyField] < booster.price) {
                throw new BadRequestException(`Not enough ${booster.money_type}`);
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    [moneyField]: { decrement: booster.price },
                },
            });

            // Traz as cartas ativas vinculadas ao booster
            const boosterCardsPool = await tx.boosterCard.findMany({
                where: {
                    booster_id: boosterId,
                    card: { in_game: 1 },
                },
                include: {
                    rarity: true,
                },
            });

            // Carrega o inventário atual do usuário para o mapa de verificação posterior
            const userCardsInventory = await tx.userCard.findMany({
                where: { user_id: userId },
            });
            const inventoryMap = new Map(userCardsInventory.map((uc) => [uc.card_id, uc.amount]));

            const usedCardsInPack = new Set<number>();
            const results: any[] = [];

            const sortedSlots = booster.slots.sort((a, b) => a.position - b.position);

            for (const slot of sortedSlots) {
                // 1. Filtra os grupos baseado apenas no conteúdo do BOOSTER e na não repetição interna do pacote
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

                // Se o booster não tiver fisicamente cartas para esse slot
                if (!validGroups.length) {
                    results.push({
                        slot: slot.position,
                        refunded: slot.unit_value ?? 0,
                    });
                    continue;
                }

                // 2. Sorteia o grupo de raridade
                const pickedGroup = this.pickGroup(validGroups);
                if (!pickedGroup) {
                    results.push({
                        slot: slot.position,
                        refunded: slot.unit_value ?? 0,
                    });
                    continue;
                }

                // 3. Sorteia a carta de forma uniforme (igualitária)
                const finalCardsPool = pickedGroup.availableCards;
                const pickedBoosterCard = finalCardsPool[Math.floor(Math.random() * finalCardsPool.length)];

                // Adiciona o ID ao Set para não repetir no mesmo pacote nas próximas iterações
                usedCardsInPack.add(pickedBoosterCard.card_id);

                // 4. 🔥 VERIFICAÇÃO DE INVENTÁRIO (SÓ AGORA)
                const currentOwnedAmount = inventoryMap.get(pickedBoosterCard.card_id) || 0;

                if (currentOwnedAmount >= 9) {
                    // O usuário já tem 9 ou mais cópias. A carta FOI gerada, mas é descartada e gera estorno
                    results.push({
                        slot: slot.position,
                        card_id: pickedBoosterCard.card_id,
                        rarity_id: pickedBoosterCard.rarity_id,
                        rarity_code: pickedBoosterCard.rarity.code,
                        refunded: slot.unit_value ?? 0, // Aplica o estorno do slot aqui
                        discardedByLimit: true // Flag opcional informativa para sua regra de negócio
                    });
                    continue;
                }

                // Se passou na validação, incrementa o mapa localmente e salva no banco
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

            // 5. Soma todos os reembolsos aplicados (por falta de carta ou limite excedido)
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

    async findAll() {
        return this.prisma.booster.findMany({
            where: { status: 1 },
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