import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDeckDto, UpdateUserDeckDto, AddDeckCardDto, SyncDeckDto } from './dto/deck.dto';

@Injectable()
export class DeckService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateUserDeckDto) {
    return this.prisma.userDeck.create({ data: dto });
  }

  findAllByUser(userId: number) {
    return this.prisma.userDeck.findMany({
      where: { user_id: userId },
      include: { cards: { include: { card: true } } },
    });
  }

  async findOne(id: number) {
    const deck = await this.prisma.userDeck.findUnique({
      where: { id },
      include: { cards: { include: { card: true } } },
    });
    if (!deck) throw new NotFoundException(`Deck #${id} não encontrado`);
    return deck;
  }

  update(id: number, dto: UpdateUserDeckDto) {
    return this.prisma.userDeck.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.userDeck.delete({ where: { id } });
  }

  // Adiciona ou atualiza a quantidade de uma carta no deck
  addOrUpdateCard(deckId: number, dto: AddDeckCardDto) {
    return this.prisma.userDeckCard.upsert({
      where: {
        user_deck_id_card_id: {
          user_deck_id: deckId,
          card_id: dto.card_id,
        },
      },
      update: { amount: dto.amount },
      create: {
        user_deck_id: deckId,
        card_id: dto.card_id,
        amount: dto.amount,
        slot: dto.slot,
      },
    });
  }

  removeCard(deckId: number, cardId: number) {
    return this.prisma.userDeckCard.delete({
      where: {
        user_deck_id_card_id: {
          user_deck_id: deckId,
          card_id: cardId,
        },
      },
    });
  }

  async syncDeck(dto: SyncDeckDto) {
    return this.prisma.$transaction(async (tx) => {
      if(!dto.user_id){
        throw new BadRequestException('user_id é obrigatório para criar um deck')
      }

      let deckId = dto.id;

      if (deckId) {
        // Verifica se o deck existe
        const existingDeck = await tx.userDeck.findUnique({
          where: { id: deckId },
        });

        if (!existingDeck) {
          throw new NotFoundException(`Deck #${deckId} não encontrado para atualização.`);
        }

        // 1. Atualiza os dados básicos do deck
        await tx.userDeck.update({
          where: { id: deckId },
          data: {
            title: dto.title,
            user_id: dto.user_id,
          },
        });

        // 2. Remove as cartas antigas para espelhar exatamente a nova lista enviada
        await tx.userDeckCard.deleteMany({
          where: { user_deck_id: deckId },
        });
      } else {
        // 1. Cria um novo deck se o ID não foi informado
        const newDeck = await tx.userDeck.create({
          data: {
            title: dto.title,
            user_id: dto.user_id,
          },
        });
        deckId = newDeck.id;
      }

      // 3. Insere todas as cartas recebidas na requisição
      if (dto.cards && dto.cards.length > 0) {
        await tx.userDeckCard.createMany({
          data: dto.cards.map((item) => ({
            user_deck_id: deckId,
            card_id: item.card_id,
            amount: item.amount,
            slot: item.slot
          })),
        });
      }

      // 4. Retorna o deck completo sincronizado com os dados das cartas
      return tx.userDeck.findUnique({
        where: { id: deckId },
        include: {
          cards: true
          // cards: {
            // include: {
            //   card: {
                // include: {
                //   texts: true,
                //   datas: true,
                // },
            //   },
            // },
          // },
        },
      });
    });
  }
}