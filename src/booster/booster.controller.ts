import { Controller, Post, Body, Req, UseGuards, Param, Get, ParseIntPipe } from '@nestjs/common';
import { BoosterService } from './booster.service';
import { CreateBoosterDto } from './dto/create-booster.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateSealedDeckDto } from './dto/create-sealed-deck.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

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
    buyBooster(@Req() req, @Param('id') id: string) {
        return this.boosterService.buyBooster(req.user.userId, Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findBoosters() {
        return this.boosterService.findBoosters();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('all')
    findAllBoosters() {
        return this.boosterService.findAllBoosters();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Post('sealed-deck')
    createSealedDeck(@Body() dto: CreateSealedDeckDto, @Req() req) {
        return this.boosterService.createSealedDeck(dto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('sealed-decks')
    findSealedDecks() {
        return this.boosterService.findSealedDecks();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('sealed-deck/all')
    findAllSealedDecks() {
        return this.boosterService.findAllSealedDecks();
    }

    @Post(':id/activate')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async activateBooster(@Param('id', ParseIntPipe) boosterId: number, @CurrentUser() user: JwtPayload) {
        return this.boosterService.activateBooster(boosterId, user);
    }

    @Post('sealed-deck/:id/activate')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async activateSealedDeck(@Param('id', ParseIntPipe) sealedDeckId: number, @CurrentUser() user: JwtPayload) {
        return this.boosterService.activateSealedDeck(sealedDeckId, user);
    }

    @Post('sealed-deck/buy/:id')
    @UseGuards(JwtAuthGuard)
    buySealedDeck(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        return this.boosterService.buySealedDeck(user.userId, Number(id));
    }
}