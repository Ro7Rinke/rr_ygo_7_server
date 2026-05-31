import {
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class BoosterCardDto {
  @IsInt()
  card_id!: number;

  @IsInt()
  rarity_id!: number;
}

class BoosterSlotGroupDto {
  @IsInt()
  @Min(0)
  min_rarity_level!: number;

  @IsInt()
  @Min(0)
  max_rarity_level!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  chance!: number;
}

class BoosterSlotDto {
  @IsInt()
  @Min(1)
  position!: number;

  @IsOptional()
  @IsInt()
  unit_value?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoosterSlotGroupDto)
  groups!: BoosterSlotGroupDto[];
}

export class CreateBoosterDto {
  @IsString()
  title!: string;

  @IsString()
  code!: string;

  @IsString()
  prefix!: string;

  @IsString()
  money_type!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
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