import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PlfListService } from './plflist.service';
import { CreatePLFListDto, UpdatePLFListDto, AddPLFCardDto } from './dto/plflist.dto';
import { PLFType } from 'src/common/enums/plf-type.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('plflist')
export class PlfListController {
  constructor(private readonly plfListService: PlfListService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreatePLFListDto) {
    return this.plfListService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('type') type?: PLFType) {
    return this.plfListService.findAll(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plfListService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePLFListDto) {
    return this.plfListService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plfListService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/cards')
  addCard(@Param('id', ParseIntPipe) id: number, @Body() dto: AddPLFCardDto) {
    return this.plfListService.addOrUpdateCard(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id/cards/:cardId')
  removeCard(
    @Param('id', ParseIntPipe) id: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.plfListService.removeCard(id, cardId);
  }
}