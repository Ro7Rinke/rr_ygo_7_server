import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsSyncService } from './cards-sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CardsController],
  providers: [CardsSyncService],
})
export class CardsModule {}