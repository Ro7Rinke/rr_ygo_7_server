import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CardsSyncService } from './cards-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly syncService: CardsSyncService, private readonly service: CardsService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async sync() {
    return this.syncService.sync();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCards(@Query('in_game') inGameStr?: string) {
    return this.service.getCards(inGameStr);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserCards(@Req() req: any) {
    return this.service.getUserCards(req.user.userId);
  }
}