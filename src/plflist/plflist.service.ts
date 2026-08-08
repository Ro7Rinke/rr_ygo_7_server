import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePLFListDto, UpdatePLFListDto, AddPLFCardDto } from './dto/plflist.dto';
import { PLFType } from 'src/common/enums/plf-type.enum';

@Injectable()
export class PlfListService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePLFListDto) {
    return this.prisma.pLFList.create({ data: dto });
  }

  findAll(type?: PLFType) {
    return this.prisma.pLFList.findMany({
      where: type ? { type } : undefined,
      include: { cards: { include: { card: true } } },
    });
  }

  async findOne(id: number) {
    const list = await this.prisma.pLFList.findUnique({
      where: { id },
      include: { cards: { include: { card: true } } },
    });
    if (!list) throw new NotFoundException(`Lista #${id} não encontrada`);
    return list;
  }

  update(id: number, dto: UpdatePLFListDto) {
    return this.prisma.pLFList.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.pLFList.delete({ where: { id } });
  }

  addOrUpdateCard(listId: number, dto: AddPLFCardDto) {
    return this.prisma.pLFListCard.upsert({
      where: {
        plflist_id_card_id: {
          plflist_id: listId,
          card_id: dto.card_id,
        },
      },
      update: {
        status: dto.status,
        status_title: dto.status_title,
      },
      create: {
        plflist_id: listId,
        card_id: dto.card_id,
        status: dto.status,
        status_title: dto.status_title,
      },
    });
  }

  removeCard(listId: number, cardId: number) {
    return this.prisma.pLFListCard.delete({
      where: {
        plflist_id_card_id: {
          plflist_id: listId,
          card_id: cardId,
        },
      },
    });
  }
}