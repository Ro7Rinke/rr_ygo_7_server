import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [AuthModule, PlayerModule, CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
