import { Controller, Post, Body, Req, UseGuards, Param, Get } from '@nestjs/common';
import { BoosterService } from './booster.service';
import { CreateBoosterDto } from './dto/create-booster.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('boosters')
export class BoosterController {
    constructor(private boosterService: BoosterService) { }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Post()
    create(@Body() dto: CreateBoosterDto, @Req() req) {
        return this.boosterService.createBooster(dto, req.user);
    }

    @Post('buy/:id')
    @UseGuards(JwtAuthGuard)
    buy(@Req() req, @Param('id') id: string) {
        return this.boosterService.buyBooster(req.user.userId, Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.boosterService.findAll();
    }
}