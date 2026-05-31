import { Module } from '@nestjs/common';
import { RarityController } from './rarity.controller';
import { RarityService } from './rarity.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RarityController],
  providers: [RarityService, PrismaService],
})
export class RarityModule {}