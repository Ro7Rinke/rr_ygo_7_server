import { Controller, Post, UseGuards } from '@nestjs/common';
import { CardsSyncService } from './cards-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsSyncService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async sync() {
    return this.service.sync();
  }
}