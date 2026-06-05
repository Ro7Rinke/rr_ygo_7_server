import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SealedDeckCardDto {
  @IsNumber()
  @IsNotEmpty()
  card_id!: number;

  @IsNumber()
  @IsNotEmpty()
  rarity_id!: number;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;
}

export class CreateSealedDeckDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  prefix!: string;

  @IsString()
  @IsNotEmpty()
  money_type!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsNumber()
  @IsNotEmpty()
  total_cards!: number;

  @IsNumber()
  @IsOptional()
  is_initial?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SealedDeckCardDto)
  cards!: SealedDeckCardDto[];
}