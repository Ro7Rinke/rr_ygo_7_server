import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateUserDeckDto, UpdateUserDeckDto, AddDeckCardDto, SyncDeckDto } from './dto/deck.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateUserDeckDto) {
    return this.deckService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  findAllByUser(@CurrentUser() user: JwtPayload) {
    if (!user.userId) {
      throw new BadRequestException('User ID não informado');
    }
    return this.deckService.findAllByUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDeckDto) {
    return this.deckService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cards')
  addCard(@Param('id', ParseIntPipe) id: number, @Body() dto: AddDeckCardDto) {
    return this.deckService.addOrUpdateCard(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cards/:cardId')
  removeCard(
    @Param('id', ParseIntPipe) id: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.deckService.removeCard(id, cardId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  syncDeck(@CurrentUser() user: JwtPayload, @Body() dto: SyncDeckDto) {

    if (!user.userId) {
      throw new BadRequestException('User ID não informado');
    }

    dto.user_id = user.userId
    
    return this.deckService.syncDeck(dto);
  }
}