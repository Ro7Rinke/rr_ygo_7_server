import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsSyncService } from './cards-sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CardsService } from './cards.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CardsController],
  providers: [CardsSyncService, CardsService],
})
export class CardsModule {}