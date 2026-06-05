import {
  Controller,
  Get,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('player')
export class PlayerController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        rp: true,
        cash: true,
        tickets: true,
        gold_tickets: true,
        wins: true,
        loses: true,
        draws: true,
        created_at: true,
        status: true,
        is_admin: true
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}