import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GameService } from './game.service';
import type { Multer } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-replay')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReplay(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    

    if (!user.userId) {
      throw new BadRequestException('User ID não informado');
    }

    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    return this.gameService.createWithReplay(user.userId, file);
  }
}