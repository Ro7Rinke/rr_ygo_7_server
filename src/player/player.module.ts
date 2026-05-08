import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlayerController],
  providers: [PrismaService],
})
export class PlayerModule {}