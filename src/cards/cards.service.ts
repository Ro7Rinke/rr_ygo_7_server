import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toIntOrNull } from 'src/common/utils';


@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) { }

  async getCards(inGameStr?: string) {
    const filter: any = {};
    const inGame = toIntOrNull(inGameStr)
    if (inGame != null && Number.isInteger(inGame)) {
      filter.in_game = inGame;
    }

    const cards = await this.prisma.cards.findMany({
      where: filter,
      include: {
        texts: true,
        datas: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return cards;
  }

  async getUserCards(userId: number) {
    return this.prisma.userCard.findMany({
      where: {
        user_id: userId,
        amount: {
          gt: 0
        }
      },
      select: {
        card_id: true,
        amount: true,
      },
    });
  }
}