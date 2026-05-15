import {
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class BoosterCardDto {
  @IsInt()
  card_id!: number;

  @IsInt()
  rarity_id!: number;
}

class SlotChanceDto {
  @IsInt()
  rarity_id!: number;

  @IsNumber()
  chance!: number;
}

class BoosterSlotDto {
  @IsInt()
  position!: number;

  @IsInt()
  min_rarity_id!: number;

  @IsInt()
  max_rarity_id!: number;

  @IsOptional()
  @IsInt()
  unit_value?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotChanceDto)
  chances!: SlotChanceDto[];
}

export class CreateBoosterDto {
  @IsString()
  title!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  price!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoosterCardDto)
  cards!: BoosterCardDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoosterSlotDto)
  slots!: BoosterSlotDto[];
}