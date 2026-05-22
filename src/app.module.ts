import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { CardsModule } from './cards/cards.module';
import { BoosterModule } from './booster/booster.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, 
    PlayerModule, 
    CardsModule, 
    BoosterModule,
    GameModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
