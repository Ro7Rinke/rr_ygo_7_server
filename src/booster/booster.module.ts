import { Module } from '@nestjs/common';
import { BoosterController } from './booster.controller';
import { BoosterService } from './booster.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BoosterController],
  providers: [BoosterService, PrismaService],
})
export class BoosterModule {}