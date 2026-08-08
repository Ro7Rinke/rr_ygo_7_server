import { Module } from '@nestjs/common';
import { PlfListService } from './plflist.service';
import { PlfListController } from './plflist.controller';

@Module({
  controllers: [PlfListController],
  providers: [PlfListService],
})
export class PlfListModule {}